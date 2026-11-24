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
  return new Function("chapters", "localStorage", "STORAGE_KEY", "LEGACY_STORAGE_KEY", "defaultState",
    "autoSaveWriteBlocked", "autoSaveWriteBlockedMessage",
    `${loadStateFunctions}\nreturn { state: loadState(), blocked: autoSaveWriteBlocked, message: autoSaveWriteBlockedMessage };`
  )(chapters, storage, "current", "legacy", defaultState, false, "");
}

const oldAutoSave = { chapter: 0, phase: "intro", line: 0, choices: {}, flags: {} };
assert.equal(chapters[load({ legacy: JSON.stringify(oldAutoSave) }).state.chapter].id, "A01",
  "pre-prologue autosaves under the legacy key should shift past P01–P03");

for (const version of [2, 3]) {
  const saved = { ...oldAutoSave, version, chapter: 3 };
  const restored = load({ current: JSON.stringify(saved) });
  assert.equal(chapters[restored.state.chapter].id, "A01", `current version ${version} should retain its chapter index`);
  assert.equal(restored.state.version, 2, "restored autosaves should normalize to the current autosave version");
  assert.equal(restored.blocked, false, "supported autosaves should allow automatic writes");
}

const unsupported = load({ current: JSON.stringify({ ...oldAutoSave, version: 4, chapter: 3 }) });
assert.equal(chapters[unsupported.state.chapter].id, "P01", "unknown current autosave versions should fall back safely");
assert.equal(unsupported.blocked, true, "unknown current autosave versions should block automatic writes");
assert.match(unsupported.message, /不支援/, "unknown current autosave versions should explain the protected fallback");
assert.equal(chapters[load({ current: JSON.stringify({ ...oldAutoSave, chapter: 3 }) }).state.chapter].id, "P01",
  "unversioned data under the current key should not be treated as a legacy save");
const malformed = load({ current: "{" });
assert.equal(chapters[malformed.state.chapter].id, "P01", "malformed JSON should fall back safely");
assert.equal(malformed.blocked, true, "malformed JSON should block automatic writes");
const unavailable = load({}, true);
assert.equal(chapters[unavailable.state.chapter].id, "P01", "unavailable localStorage should fall back safely");
assert.equal(unavailable.blocked, true, "unavailable localStorage should block automatic writes");

const invalidPhase = load({ current: JSON.stringify({ ...oldAutoSave, version: 2, phase: "future-phase" }) });
assert.equal(invalidPhase.blocked, true, "invalid saved phases should block automatic writes");
for (const raw of ["null", "false", "", "[]"]) {
  const invalidValue = load({ current: raw });
  assert.equal(invalidValue.blocked, true, `stored non-object value ${JSON.stringify(raw)} should block automatic writes`);
}

const saveStateSource = readFunction("saveState", "getSequence");
function runSave(initial, blocked, message) {
  const testStorage = memoryStorage(initial);
  const fn = new Function("state", "replayMode", "localStorage", "STORAGE_KEY", "document",
    "autoSaveWriteBlocked", "autoSaveWriteBlockedMessage",
    `${saveStateSource}\nreturn saveState;`)(
      { version: 3, chapter: 3, phase: "intro", line: 0 }, false, testStorage, "current",
      { getElementById() { return { textContent: "" }; } }, blocked, message
    );
  fn();
  return testStorage;
}
const storage = memoryStorage();
const saveSupported = new Function("state", "replayMode", "localStorage", "STORAGE_KEY", "document",
  "autoSaveWriteBlocked", "autoSaveWriteBlockedMessage",
  `${saveStateSource}\nreturn saveState;`)(
    { version: 3, chapter: 3, phase: "intro", line: 0 }, false, storage, "current",
    { getElementById() { return { textContent: "" }; } }, false, ""
  );
saveSupported();
assert.equal(JSON.parse(storage.value("current")).version, 2,
  "manual-save state must be normalized before it reaches the autosave key");
assert.equal(JSON.parse(storage.value("current")).chapter, 3,
  "normalizing the autosave version must preserve the current chapter index");

for (const [label, initial] of [
  ["unknown version", { current: JSON.stringify({ ...oldAutoSave, version: 4, chapter: 3 }) }],
  ["malformed JSON", { current: "{" }],
  ["null JSON", { current: "null" }]
]) {
  const original = initial.current;
  const protectedStorage = runSave(initial, true, "自動存檔已暫停");
  assert.equal(protectedStorage.value("current"), original,
    `${label} should not be overwritten by the default fallback state`);
}

const restartSource = readFunction("restart", "returnToMain");
const restartHarness = new Function("state", "replayMode", "window", "defaultState", "autoSaveWriteBlocked",
  "autoSaveWriteBlockedMessage", "dialogueHistory", "lastHistoryKey", "renderHistory", "render", "playConfirmSound",
  `${restartSource}\nreturn { run: restart, blocked: () => autoSaveWriteBlocked, message: () => autoSaveWriteBlockedMessage };`
)(
  defaultState(), false, { confirm: () => true }, defaultState, true, "舊存檔無法讀取",
  [], "", () => {}, () => {}, () => {}
);
restartHarness.run();
assert.equal(restartHarness.blocked(), false, "explicit restart should release the automatic-write protection");
assert.equal(restartHarness.message(), "", "explicit restart should clear the protection message");

const manualLoadSource = readFunction("loadManualSlot", "saveManual");
const manualLoadHarness = new Function("index", "loadManualSlots", "isValidManualSave", "defaultState", "chapters",
  "state", "autoSaveWriteBlocked", "autoSaveWriteBlockedMessage", "replayMode", "mainStateSnapshot",
  "dialogueHistory", "lastHistoryKey", "renderHistory", "document", "render",
  `${manualLoadSource}\nreturn { run: () => loadManualSlot(index), blocked: () => autoSaveWriteBlocked };`
)(
  0, () => [{ chapter: 3, phase: "intro", line: 0, flags: {}, choices: {} }], () => true,
  defaultState, chapters, defaultState(), true, "舊存檔無法讀取", false, null, [], "", () => {},
  { getElementById() { return { close() {} }; } }, () => {}
);
manualLoadHarness.run();
assert.equal(manualLoadHarness.blocked(), false, "loading a valid manual save should release the automatic-write protection");

console.log("Autosave migration checks passed (legacy/current versions, invalid and unreadable data protection, safe writes, explicit recovery).");
