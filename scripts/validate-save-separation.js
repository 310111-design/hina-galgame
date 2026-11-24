#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const gameSource = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const dataSource = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const dataPrefix = "window.HINA_GAME_DATA = ";
if (!dataSource.startsWith(dataPrefix)) throw new Error("game-data.js has an unexpected format");
const chapters = JSON.parse(dataSource.slice(dataPrefix.length).trim().replace(/;\s*$/, ""));

function readFunction(name, nextName) {
  const start = gameSource.indexOf(`function ${name}(`);
  const end = gameSource.indexOf(`\nfunction ${nextName}(`, start);
  if (start < 0 || end < 0) throw new Error(`Unable to find ${name} in site/game.js`);
  return gameSource.slice(start, end);
}

const runtimeFunctions = [
  readFunction("loadManualSlots", "normalizeManualSave"),
  readFunction("normalizeManualSave", "isValidManualSave"),
  readFunction("isValidManualSave", "openSaveMenu"),
  readFunction("cloneState", "saveState"),
  readFunction("saveState", "getSequence"),
  readFunction("saveManualSlot", "loadManualSlot")
].join("\n");

const initialAutoSave = {
  version: 2,
  chapter: 8,
  phase: "intro",
  line: 2,
  choices: { B02: { letter: "A" } },
  flags: { rest: 2, teamwork: 1, ordinary_day: 0, daily_checkin: 1, self_rest: 0 },
  route: null
};
const existingManualSave = { version: 3, chapter: 8, phase: "intro", line: 2, choices: {}, flags: {}, route: null, savedAt: "2026-11-24T00:00:00.000Z" };
const initialSlots = [existingManualSave, null, null, null, null, null];
const initialAutoRaw = JSON.stringify(initialAutoSave);
const initialSlotsRaw = JSON.stringify(initialSlots);
const values = new Map([["autosave", initialAutoRaw], ["manual-slots", initialSlotsRaw]]);
const writes = [];
const localStorage = {
  getItem(key) { return values.get(key) ?? null; },
  setItem(key, value) {
    writes.push(key);
    values.set(key, String(value));
  }
};

let state = {
  version: 3,
  chapter: 9,
  phase: "intro",
  line: 4,
  choices: { B03: { letter: "B" } },
  flags: { rest: 3, teamwork: 1, ordinary_day: 0, daily_checkin: 1, self_rest: 0 },
  route: null
};
let manualSaveWriteBlocked = false;
let manualSaveWriteBlockedMessage = "";
let autoSaveWriteBlocked = false;
let autoSaveWriteBlockedMessage = "";
let replayMode = false;
let saveStatus = "";
const document = {
  getElementById(id) {
    if (id === "saveDialog") return { close() {} };
    if (id === "saveState") return { set textContent(value) { saveStatus = value; } };
    return {};
  }
};
const window = { confirm: () => true };

const harness = new Function(
  "chapters", "localStorage", "STORAGE_KEY", "MANUAL_SAVE_KEY", "MANUAL_SLOTS_KEY", "MANUAL_SLOT_COUNT",
  "document", "window",
  `let manualSaveWriteBlocked = false;\nlet manualSaveWriteBlockedMessage = "";\nlet autoSaveWriteBlocked = false;\nlet autoSaveWriteBlockedMessage = "";\nlet replayMode = false;\nlet state = {};\n${runtimeFunctions}\nreturn {\n  loadManualSlots, saveManualSlot, saveState, setState(value) { state = value; }\n};`
)(chapters, localStorage, "autosave", "legacy", "manual-slots", 6, document, window);
harness.setState(state);

assert.deepEqual(harness.loadManualSlots(), initialSlots, "initial manual slots should load without modifying either key");
assert.deepEqual(writes, [], "reading manual slots should not write storage");

harness.saveManualSlot(1);
assert.equal(writes.length, 1);
assert.equal(writes[0], "manual-slots", "manual save should write only the manual-slot key");
assert.equal(values.get("autosave"), initialAutoRaw, "manual save should not overwrite the main autosave");
let savedSlots = JSON.parse(values.get("manual-slots"));
assert.deepEqual(savedSlots[0], existingManualSave, "saving one slot should preserve the other manual slots");
assert.equal(savedSlots[1].chapter, state.chapter);
assert.equal(savedSlots[1].line, state.line);
assert.equal(savedSlots[1].version, 3);
assert.ok(savedSlots[1].savedAt, "manual save should keep its timestamp");

const manualRawBeforeAutoSave = values.get("manual-slots");
state = { ...state, chapter: 12, phase: "branch", line: 1, flags: { ...state.flags, teamwork: 2 } };
harness.setState(state);
harness.saveState();
assert.equal(writes.length, 2);
assert.equal(writes[1], "autosave", "autosave should write only the main autosave key");
assert.equal(values.get("manual-slots"), manualRawBeforeAutoSave, "autosave should not overwrite manual slots");
const savedAuto = JSON.parse(values.get("autosave"));
assert.equal(savedAuto.chapter, state.chapter);
assert.equal(savedAuto.phase, state.phase);
assert.equal(savedAuto.version, 2, "autosave should retain its own version marker");

console.log("Save separation checks passed (manual and autosave keys remain independent while preserving sibling slots).");
