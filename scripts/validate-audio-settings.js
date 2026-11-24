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

function readListener(id, event) {
  const start = gameSource.indexOf(`document.getElementById("${id}").addEventListener("${event}"`);
  const end = gameSource.indexOf("\n});", start);
  if (start < 0 || end < 0) throw new Error(`Unable to find ${event} listener for #${id}`);
  return gameSource.slice(start, end + 4);
}

function memoryStorage(initial = {}, unavailable = false) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      if (unavailable) throw new Error("localStorage unavailable");
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      if (unavailable) throw new Error("localStorage unavailable");
      values.set(key, String(value));
    },
    value(key) { return values.get(key); }
  };
}

const audioFunctions = [
  readFunction("loadAudioSettings", "saveAudioSettings"),
  readFunction("saveAudioSettings", "updateAudioControls"),
  readFunction("updateAudioControls", "saveReadingSettings")
].join("\n");
const audioListeners = [
  readListener("audioToggle", "click"),
  readListener("bgmVolume", "input"),
  readListener("sfxVolume", "input")
].join("\n");

function createHarness(storage) {
  const elements = new Map();
  for (const id of ["audioToggle", "bgmVolume", "sfxVolume"]) {
    const listeners = new Map();
    const label = { textContent: "" };
    elements.set(id, {
      value: "",
      attributes: {},
      addEventListener(type, handler) { listeners.set(type, handler); },
      setAttribute(name, value) { this.attributes[name] = value; },
      querySelector(selector) { return selector === ".audio-toggle-label" ? label : null; },
      emit(type, event = {}) { const handler = listeners.get(type); if (!handler) throw new Error(`Missing ${type} listener on #${id}`); handler(event); },
      label
    });
  }
  const document = { getElementById(id) { return elements.get(id) || null; } };
  let startAmbientCalls = 0;
  let stopAmbientCalls = 0;
  const runtime = new Function(
    "localStorage", "AUDIO_SETTINGS_KEY", "document", "startAmbient", "stopAmbient",
    `let audioSettings;\nlet musicEnabled;\nlet audioContext = { currentTime: 12 };\nlet ambientMaster = null;\n${audioFunctions}\n${audioListeners}\nreturn {\n  initialize() { audioSettings = loadAudioSettings(); musicEnabled = audioSettings.enabled; updateAudioControls(); },\n  getSettings() { return JSON.parse(JSON.stringify(audioSettings)); },\n  isMusicEnabled() { return musicEnabled; },\n  setAmbientMaster(value) { ambientMaster = value; },\n  emit(id, type, event) { document.getElementById(id).emit(type, event); },\n  updateAudioControls, loadAudioSettings, saveAudioSettings\n};`
  )(
    storage, "hina-audio-settings-v1", document,
    () => { startAmbientCalls += 1; },
    () => { stopAmbientCalls += 1; }
  );
  runtime.initialize();
  return {
    ...runtime,
    elements,
    storage,
    startAmbientCalls: () => startAmbientCalls,
    stopAmbientCalls: () => stopAmbientCalls
  };
}

const defaults = createHarness(memoryStorage());
assert.deepEqual(defaults.getSettings(), { bgmVolume: 0.55, sfxVolume: 0.65, enabled: true });

const malformed = createHarness(memoryStorage({ "hina-audio-settings-v1": "{" }));
assert.deepEqual(malformed.getSettings(), { bgmVolume: 0.55, sfxVolume: 0.65, enabled: true }, "corrupt settings should fall back to defaults");

const bounded = createHarness(memoryStorage({
  "hina-audio-settings-v1": JSON.stringify({ bgmVolume: -3, sfxVolume: 4, enabled: false })
}));
assert.deepEqual(bounded.getSettings(), { bgmVolume: 0, sfxVolume: 1, enabled: false }, "loaded volumes should clamp to [0, 1]");
assert.equal(bounded.elements.get("audioToggle").attributes["aria-pressed"], "false");
assert.equal(bounded.elements.get("audioToggle").attributes["aria-label"], "開啟音訊");

const storage = memoryStorage();
const harness = createHarness(storage);
const gainCalls = [];
harness.setAmbientMaster({ gain: { setTargetAtTime(...args) { gainCalls.push(args); } } });
harness.emit("bgmVolume", "input", { currentTarget: { value: "0.8" } });
assert.equal(harness.getSettings().bgmVolume, 0.8);
assert.deepEqual(gainCalls, [[0.018 * 0.8, 12, 0.06]], "BGM input should smoothly update the active master gain");
harness.emit("sfxVolume", "input", { currentTarget: { value: "0.25" } });
assert.equal(harness.getSettings().sfxVolume, 0.25);
assert.equal(harness.getSettings().bgmVolume, 0.8, "SFX input should leave BGM level unchanged");
assert.deepEqual(JSON.parse(storage.value("hina-audio-settings-v1")), harness.getSettings(), "volume changes should persist independently");

harness.emit("audioToggle", "click");
assert.equal(harness.isMusicEnabled(), false);
assert.equal(harness.getSettings().enabled, false);
assert.equal(harness.stopAmbientCalls(), 1, "turning audio off should stop ambient playback");
assert.equal(harness.elements.get("audioToggle").attributes["aria-pressed"], "false");
assert.equal(harness.elements.get("audioToggle").attributes["aria-label"], "開啟音訊");
harness.emit("audioToggle", "click");
assert.equal(harness.isMusicEnabled(), true);
assert.equal(harness.getSettings().enabled, true);
assert.equal(harness.startAmbientCalls(), 1, "turning audio on should resume ambient playback");
assert.equal(harness.elements.get("audioToggle").label.textContent, "音訊開");

const reloaded = createHarness(storage);
assert.deepEqual(reloaded.getSettings(), harness.getSettings(), "saved audio settings should survive a reload");
assert.equal(reloaded.elements.get("bgmVolume").value, "0.8");
assert.equal(reloaded.elements.get("sfxVolume").value, "0.25");

const gainless = createHarness(memoryStorage());
gainless.emit("bgmVolume", "input", { currentTarget: { value: "2" } });
assert.equal(gainless.getSettings().bgmVolume, 1, "BGM input should clamp at one");
assert.equal(gainless.startAmbientCalls(), 1, "raising BGM from zero without an active gain should start ambient playback");
gainless.emit("bgmVolume", "input", { currentTarget: { value: "-1" } });
assert.equal(gainless.getSettings().bgmVolume, 0, "BGM input should clamp at zero");
gainless.emit("sfxVolume", "input", { currentTarget: { value: "-1" } });
assert.equal(gainless.getSettings().sfxVolume, 0, "SFX input should clamp at zero");

console.log("Audio setting runtime checks passed (defaults, invalid storage, clamping, independent levels, toggle, control labels and persistence).");
