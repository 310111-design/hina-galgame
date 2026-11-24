#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const gameSource = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");

function readFunction(name, nextName) {
  const start = gameSource.indexOf(`function ${name}(`);
  const end = gameSource.indexOf(`\nfunction ${nextName}(`, start);
  if (start < 0 || end < 0) throw new Error(`Unable to find ${name} in site/game.js`);
  return gameSource.slice(start, end);
}

const profilesSource = gameSource.match(/const MUSIC_PROFILES = (\{[\s\S]*?\n\});/)?.[1];
if (!profilesSource) throw new Error("Unable to find MUSIC_PROFILES in site/game.js");
const profiles = new Function(`return (${profilesSource});`)();
const audioFunctions = [
  readFunction("ensureAudio", "createAmbient"),
  readFunction("createAmbient", "startAmbient"),
  readFunction("startAmbient", "transitionAmbient"),
  readFunction("transitionAmbient", "stopAmbient"),
  readFunction("stopAmbient", "playChapterTransitionSound")
].join("\n");

class MockAudioContext {
  constructor() {
    this.state = "suspended";
    this.currentTime = 8;
    this.destination = {};
    this.resumeCalls = 0;
    this.gains = [];
    this.oscillators = [];
  }
  resume() {
    this.resumeCalls += 1;
    this.state = "running";
    return Promise.resolve();
  }
  createGain() {
    const node = {
      calls: [],
      disconnected: false,
      gain: {
        value: 0,
        calls: [],
        setValueAtTime(value, time) { this.calls.push(["set", value, time]); },
        linearRampToValueAtTime(value, time) { this.calls.push(["ramp", value, time]); },
        cancelScheduledValues(time) { this.calls.push(["cancel", time]); },
        setTargetAtTime(value, time, constant) { this.calls.push(["target", value, time, constant]); }
      },
      connect(destination) { this.calls.push(["connect", destination]); return destination; },
      disconnect() { this.disconnected = true; }
    };
    this.gains.push(node);
    return node;
  }
  createOscillator() {
    const node = {
      type: "",
      frequency: { value: 0 },
      starts: [],
      stops: [],
      disconnected: false,
      connect(destination) { this.destination = destination; return destination; },
      start(time) { this.starts.push(time); },
      stop(time) { this.stops.push(time); },
      disconnect() { this.disconnected = true; }
    };
    this.oscillators.push(node);
    return node;
  }
}

function createHarness() {
  const timers = [];
  const window = {
    AudioContext: MockAudioContext,
    webkitAudioContext: null,
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; }
  };
  const runtime = new Function(
    "window", "MUSIC_PROFILES", "timers",
    `let audioContext = null;\nlet audioSettings = { bgmVolume: 0.5 };\nlet musicEnabled = true;\nlet activeSceneType = "office";\nlet ambientNodes = [];\nlet ambientMaster = null;\nlet currentMusicScene = null;\n${audioFunctions}\nreturn {\n  startAmbient, transitionAmbient, stopAmbient,\n  getContext() { return audioContext; },\n  getNodes() { return [...ambientNodes]; },\n  getMaster() { return ambientMaster; },\n  getScene() { return currentMusicScene; },\n  setEnabled(value) { musicEnabled = value; },\n  setActiveScene(value) { activeSceneType = value; },\n  setContextState(value) { audioContext.state = value; },\n  getTimers() { return timers; }\n};`
  )(window, profiles, timers);
  return runtime;
}

const harness = createHarness();
harness.startAmbient();
const context = harness.getContext();
const officeNodes = harness.getNodes();
const officeMaster = harness.getMaster();
assert.equal(context.state, "running", "first playback should resume a suspended context after a user gesture");
assert.equal(context.resumeCalls, 1);
assert.equal(harness.getScene(), "office");
assert.deepEqual(context.oscillators.map(node => node.frequency.value), profiles.office.notes);
assert.equal(context.oscillators.length, profiles.office.notes.length);
assert.equal(officeMaster.gain.calls[0][0], "set");
assert.equal(officeMaster.gain.calls[0][1], 0);
assert.deepEqual(officeMaster.gain.calls[1], ["ramp", 0.009, 8.7]);

harness.startAmbient();
assert.equal(context.oscillators.length, profiles.office.notes.length, "starting twice should not duplicate active ambient nodes");
assert.equal(context.resumeCalls, 1);
harness.transitionAmbient("office");
assert.equal(harness.getScene(), "office", "transitioning to the current scene should be a no-op");

harness.transitionAmbient("corridor");
const corridorNodes = harness.getNodes();
const corridorMaster = harness.getMaster();
assert.equal(harness.getScene(), "corridor");
assert.deepEqual(officeMaster.gain.calls.slice(-2), [["cancel", 8], ["target", 0, 8, 0.12]]);
assert.ok(context.oscillators.slice(0, profiles.office.notes.length).every(node => node.stops[0] === 8.65));
assert.equal(harness.getTimers()[0].delay, 800);
assert.ok(corridorMaster.gain.calls.some(call => call[0] === "ramp" && call[2] === 8.75), "new scene should fade in over the configured interval");

harness.transitionAmbient("rooftop");
const rooftopNodes = harness.getNodes();
assert.equal(harness.getScene(), "rooftop", "a rapid second transition should select the newest scene");
assert.equal(harness.getTimers().length, 2);
harness.getTimers()[0].callback();
assert.ok(officeNodes.every(node => node.disconnected), "the first cleanup should disconnect only the first scene nodes");
assert.ok(corridorNodes.every(node => !node.disconnected), "the first cleanup should not disconnect the current scene");
assert.ok(rooftopNodes.every(node => !node.disconnected), "the first cleanup should not disconnect the newest scene");
harness.getTimers()[1].callback();
assert.ok(corridorNodes.every(node => node.disconnected), "the second cleanup should disconnect the previous scene");
assert.ok(rooftopNodes.every(node => !node.disconnected), "the second cleanup should preserve the newest scene");

harness.setContextState("suspended");
harness.startAmbient();
assert.equal(context.resumeCalls, 2, "starting after context suspension should retry resume");

harness.setEnabled(false);
const rooftopMaster = harness.getMaster();
harness.stopAmbient();
assert.equal(harness.getScene(), null);
assert.equal(harness.getNodes().length, 0);
assert.ok(rooftopMaster.gain.calls.some(call => call[0] === "target" && call[1] === 0 && call[3] === 0.06));
assert.ok(context.oscillators.slice(-profiles.rooftop.notes.length).every(node => node.stops.includes(8.3)));
assert.equal(harness.getTimers()[2].delay, 450);
harness.getTimers()[2].callback();
assert.ok(rooftopNodes.every(node => node.disconnected), "stop cleanup should disconnect the outgoing scene nodes");
harness.startAmbient();
assert.equal(harness.getNodes().length, 0, "disabled audio should not restart ambient playback");

console.log("Audio transition runtime checks passed (initial resume, no duplicate nodes, scene fades, rapid switches, cleanup, resume and mute).");
