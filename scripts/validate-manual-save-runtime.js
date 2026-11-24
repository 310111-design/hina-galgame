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

const manualSaveFunctions = [
  readFunction("loadManualSlots", "normalizeManualSave"),
  readFunction("normalizeManualSave", "isValidManualSave"),
  readFunction("isValidManualSave", "openSaveMenu"),
  readFunction("saveManualSlot", "loadManualSlot"),
  readFunction("loadManualSlot", "saveManual")
].join("\n");

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    value(key) { return values.get(key); }
  };
}

function makeState(line, overrides = {}) {
  return {
    version: 3,
    chapter: chapters.findIndex(chapter => chapter.id === "A01"),
    phase: "intro",
    line,
    flags: { rest: 1, teamwork: 2, ordinary_day: 0, daily_checkin: 3, self_rest: 1 },
    choices: { A01: { letter: "B", label: "work together" } },
    route: null,
    ...overrides
  };
}

function createHarness(storage, confirmResponses = []) {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { textContent: "", closeCount: 0, close() { this.closeCount += 1; } });
      return elements.get(id);
    }
  };
  const confirmMessages = [];
  const window = {
    confirm(message) { confirmMessages.push(message); return confirmResponses.shift() ?? true; }
  };
  let renderHistoryCalls = 0;
  let renderCalls = 0;
  const defaultState = () => ({
    version: 3,
    chapter: 0,
    phase: "intro",
    line: 0,
    flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0, self_rest: 0 },
    choices: {},
    route: null
  });
  const runtime = new Function(
    "chapters", "localStorage", "MANUAL_SAVE_KEY", "MANUAL_SLOTS_KEY", "MANUAL_SLOT_COUNT",
    "document", "window", "cloneState", "defaultState", "renderHistory", "render", "initialState",
    `let manualSaveWriteBlocked = false;\nlet manualSaveWriteBlockedMessage = "";\nlet replayMode = false;\nlet autoSaveWriteBlocked = true;\nlet autoSaveWriteBlockedMessage = "blocked before loading";\nlet mainStateSnapshot = { chapter: 17 };\nlet dialogueHistory = [["陽奈", "old history"]];\nlet lastHistoryKey = "old key";\nlet state = JSON.parse(JSON.stringify(initialState));\n${manualSaveFunctions}\nreturn { loadManualSlots, saveManualSlot, loadManualSlot, setState(value) { state = JSON.parse(JSON.stringify(value)); }, setReplayMode(value) { replayMode = value; }, getState() { return JSON.parse(JSON.stringify(state)); }, blocked: () => manualSaveWriteBlocked, autoBlocked: () => autoSaveWriteBlocked, replay: () => replayMode, hasSnapshot: () => mainStateSnapshot !== null, history: () => dialogueHistory, lastHistoryKey: () => lastHistoryKey };`
  )(
    chapters, storage, "legacy", "slots", 6, document, window,
    value => JSON.parse(JSON.stringify(value)), defaultState,
    () => { renderHistoryCalls += 1; }, () => { renderCalls += 1; }, makeState(0)
  );
  return {
    ...runtime,
    storage,
    elements,
    confirmMessages,
    renderHistoryCalls: () => renderHistoryCalls,
    renderCalls: () => renderCalls,
    saveState: () => document.getElementById("saveState").textContent,
    dialogCloses: () => document.getElementById("saveDialog").closeCount
  };
}

const storage = memoryStorage();
const harness = createHarness(storage, [false, true]);
for (let slot = 0; slot < 6; slot += 1) {
  harness.setState(makeState(slot));
  harness.saveManualSlot(slot);
}
const sixSlots = JSON.parse(storage.value("slots"));
assert.equal(sixSlots.length, 6, "the save container should contain exactly six slots");
assert.deepEqual(sixSlots.map(saved => saved.line), [0, 1, 2, 3, 4, 5], "each empty slot should save its own progress");
assert.equal(harness.saveState(), "手動存檔完成（欄位 6）");
assert.equal(harness.dialogCloses(), 6);

const originalThirdSlot = sixSlots[2];
harness.setState(makeState(7));
harness.saveManualSlot(2);
assert.equal(harness.confirmMessages.at(-1), "確定覆蓋存檔欄位 3 嗎？");
assert.deepEqual(JSON.parse(storage.value("slots"))[2], originalThirdSlot, "canceling overwrite should preserve the original slot");
assert.equal(harness.dialogCloses(), 6, "canceling overwrite should keep the dialog open");

harness.setState(makeState(8));
harness.saveManualSlot(2);
const afterOverwrite = JSON.parse(storage.value("slots"));
assert.equal(afterOverwrite[2].line, 8, "confirming overwrite should replace the selected slot");
assert.equal(afterOverwrite[0].line, 0, "overwriting one slot should preserve unrelated slots");
assert.equal(harness.saveState(), "手動存檔完成（欄位 3）");

harness.setReplayMode(true);
harness.loadManualSlot(2);
assert.equal(harness.getState().line, 8, "loading a save should restore its progress");
assert.equal(harness.getState().flags.teamwork, 2);
assert.equal(harness.getState().choices.A01.letter, "B");
assert.equal(harness.autoBlocked(), false, "a valid manual load should release autosave protection");
assert.equal(harness.replay(), false, "a valid manual load should end chapter replay");
assert.equal(harness.hasSnapshot(), false, "a valid manual load should discard the replay snapshot");
assert.equal(harness.history().length, 0, "a valid manual load should clear old dialogue history");
assert.equal(harness.lastHistoryKey(), "");
assert.equal(harness.renderHistoryCalls(), 1);
assert.equal(harness.renderCalls(), 1);
assert.equal(harness.saveState(), "已讀取存檔欄位 3");

const emptyHarness = createHarness(memoryStorage());
const beforeEmptyRead = emptyHarness.getState();
emptyHarness.loadManualSlot(0);
assert.equal(emptyHarness.saveState(), "存檔格式無效或已損壞", "reading an empty slot should show a recoverable message");
assert.deepEqual(emptyHarness.getState(), beforeEmptyRead, "reading an empty slot should not change current progress");
assert.equal(emptyHarness.dialogCloses(), 0, "reading an empty slot should keep the dialog open");

const corruptSlots = [null, { version: 4, chapter: 3, phase: "intro", line: 0 }, null, null, null, null];
const corruptRaw = JSON.stringify(corruptSlots);
const corruptStorage = memoryStorage({ slots: corruptRaw });
const corruptHarness = createHarness(corruptStorage);
const beforeCorruptRead = corruptHarness.getState();
corruptHarness.loadManualSlot(1);
assert.equal(corruptHarness.blocked(), true, "an unsupported slot should suspend writes");
assert.equal(corruptHarness.saveState(), "存檔格式無效或已損壞");
assert.deepEqual(corruptHarness.getState(), beforeCorruptRead, "reading a corrupt slot should not change progress");
assert.equal(corruptStorage.value("slots"), corruptRaw, "reading a corrupt slot should preserve its raw container");
assert.equal(corruptHarness.dialogCloses(), 0);

console.log("Manual save runtime checks passed (all six slots, overwrite cancel/confirm, isolated replacement, valid read, empty read and unsupported-slot preservation).");
