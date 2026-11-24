#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const gameSource = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const dataSource = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const prefix = "window.HINA_GAME_DATA = ";
if (!dataSource.startsWith(prefix)) throw new Error("game-data.js has an unexpected format");
const chapters = JSON.parse(dataSource.slice(prefix.length).trim().replace(/;\s*$/, ""));

function readFunction(name, nextName) {
  const start = gameSource.indexOf(`function ${name}(`);
  const end = gameSource.indexOf(`\nfunction ${nextName}(`, start);
  if (start < 0 || end < 0) throw new Error(`Unable to find ${name} in site/game.js`);
  return gameSource.slice(start, end);
}

const loadStateFunctions = [
  readFunction("getAutoSaveChapterOffset", "loadState"),
  readFunction("loadState", "cloneState")
].join("\n");
const defaultState = () => ({
  version: 2,
  chapter: 0,
  phase: "intro",
  line: 0,
  choices: {},
  flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0, self_rest: 0 },
  route: null
});

function memoryStorage(initial = {}, unavailable = false) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      if (unavailable) throw new Error("localStorage unavailable");
      return values.get(key) ?? null;
    },
    setItem(key, value) { values.set(key, String(value)); },
    value(key) { return values.get(key); }
  };
}

function load(initial, unavailable = false) {
  const storage = memoryStorage(initial, unavailable);
  const fn = new Function("chapters", "localStorage", "STORAGE_KEY", "LEGACY_STORAGE_KEY", "defaultState",
    `${loadStateFunctions}\nreturn loadState;`)(chapters, storage, "current", "legacy", defaultState);
  return fn();
}

const oldAutoSave = { chapter: 0, phase: "intro", line: 0, choices: {}, flags: {} };
assert.equal(chapters[load({ legacy: JSON.stringify(oldAutoSave) }).chapter].id, "A01",
  "pre-prologue autosaves under the legacy key should shift past P01–P03");

for (const version of [2, 3]) {
  const saved = { ...oldAutoSave, version, chapter: 3 };
  const restored = load({ current: JSON.stringify(saved) });
  assert.equal(chapters[restored.chapter].id, "A01", `current version ${version} should retain its chapter index`);
  assert.equal(restored.version, 2, "restored autosaves should normalize to the current autosave version");
}

const unsupported = load({ current: JSON.stringify({ ...oldAutoSave, version: 4, chapter: 3 }) });
assert.equal(chapters[unsupported.chapter].id, "P01", "unknown current autosave versions should fall back safely");
assert.equal(chapters[load({ current: JSON.stringify({ ...oldAutoSave, chapter: 3 }) }).chapter].id, "P01",
  "unversioned data under the current key should not be treated as a legacy save");
assert.equal(chapters[load({ current: "{" }).chapter].id, "P01", "malformed JSON should fall back safely");
assert.equal(chapters[load({}, true).chapter].id, "P01", "unavailable localStorage should fall back safely");

const saveStateSource = readFunction("saveState", "getSequence");
const saveState = new Function("state", "replayMode", "localStorage", "STORAGE_KEY", "document",
  `${saveStateSource}\nreturn saveState;`);
const storage = memoryStorage();
saveState({ version: 3, chapter: 3, phase: "intro", line: 0 }, false, storage, "current", {
  getElementById() { return { textContent: "" }; }
})();
assert.equal(JSON.parse(storage.value("current")).version, 2,
  "manual-save state must be normalized before it reaches the autosave key");
assert.equal(JSON.parse(storage.value("current")).chapter, 3,
  "normalizing the autosave version must preserve the current chapter index");

console.log("Autosave migration checks passed (legacy key, current v2/v3, unsupported version, malformed/unavailable storage).");
