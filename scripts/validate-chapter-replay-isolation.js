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
  readFunction("cloneState", "saveState"),
  readFunction("saveState", "getSequence"),
  readFunction("choose", "restart"),
  readFunction("restart", "returnToMain"),
  readFunction("returnToMain", "openChapterMenu"),
  readFunction("openChapterMenu", "loadManualSlots"),
  readFunction("saveManualSlot", "loadManualSlot")
].join("\n");

const originalState = {
  version: 2,
  chapter: 18,
  phase: "common",
  line: 3,
  choices: { B05: { letter: "C", label: "保留主線選擇" } },
  flags: { rest: 4, teamwork: 2, ordinary_day: 1, daily_checkin: 2, self_rest: 0 },
  route: "partner"
};
const manualSlotsRaw = JSON.stringify([{ version: 3, chapter: 18, phase: "common", line: 3 }]);
const storageValues = new Map([
  ["autosave", JSON.stringify(originalState)],
  ["manual-slots", manualSlotsRaw]
]);
let writeCount = 0;
const localStorage = {
  getItem(key) { return storageValues.get(key) ?? null; },
  setItem(key, value) {
    writeCount += 1;
    storageValues.set(key, String(value));
  }
};

let state = JSON.parse(JSON.stringify(originalState));
let replayMode = false;
let mainStateSnapshot = null;
let autoSaveWriteBlocked = false;
let autoSaveWriteBlockedMessage = "";
let dialogueHistory = [];
let lastHistoryKey = "";
let saveStatus = "";
const chapterButtons = [];
const chapterList = {
  innerHTML: "",
  appendChild(button) { chapterButtons.push(button); }
};
const document = {
  getElementById(id) {
    if (id === "chapterList") return chapterList;
    if (id === "chapterDialog") return { showModal() {}, close() {} };
    if (id === "saveState") return { set textContent(value) { saveStatus = value; } };
    return { close() {} };
  },
  createElement() {
    return {
      addEventListener(_event, handler) { this.click = handler; }
    };
  }
};
const window = { confirm: () => true };
const defaultState = () => ({
  version: 2,
  chapter: 0,
  phase: "intro",
  line: 0,
  choices: {},
  flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0, self_rest: 0 },
  route: null
});

const harness = new Function(
  "chapters", "localStorage", "STORAGE_KEY", "document", "window", "defaultState",
  "clearAutoAdvance", "renderHistory", "render", "playConfirmSound", "playChapterTransitionSound",
  `let state = {};\nlet replayMode = false;\nlet mainStateSnapshot = null;\nlet autoSaveWriteBlocked = false;\nlet autoSaveWriteBlockedMessage = "";\nlet dialogueHistory = [];\nlet lastHistoryKey = "";\n${runtimeFunctions}\nreturn {\n  openChapterMenu, choose, restart, returnToMain, saveState, saveManualSlot,\n  setState(value) { state = value; }, getState() { return state; },\n  getReplay() { return replayMode; }\n};`
)(chapters, localStorage, "autosave", document, window, defaultState, () => {}, () => {}, () => {}, () => {}, () => {});
harness.setState(state);

harness.openChapterMenu();
assert.equal(chapterButtons.length, chapters.length, "chapter menu should expose every chapter for direct replay");
chapterButtons[0].click();
assert.equal(harness.getReplay(), true, "opening a chapter from the main story should enter replay mode");
assert.equal(harness.getState().chapter, 0);
assert.deepEqual(harness.getState().flags, originalState.flags, "replay should start from a copy of the main progress flags");

harness.choose(chapters[0].choices[0]);
assert.notDeepEqual(harness.getState().flags, originalState.flags, "replay choice should update replay-local flags");
const writesBeforeReplaySave = writeCount;
harness.saveManualSlot(0);
assert.equal(saveStatus, "章節重玩不會覆蓋主線存檔");
assert.equal(storageValues.get("manual-slots"), manualSlotsRaw, "manual saves should be blocked during chapter replay");
harness.saveState();
assert.equal(writeCount, writesBeforeReplaySave, "autosave writes should be blocked during chapter replay");
assert.equal(saveStatus, "章節重玩｜主線存檔不變");
assert.equal(storageValues.get("manual-slots"), manualSlotsRaw, "chapter replay should not modify manual save slots");

chapterButtons.length = 0;
harness.openChapterMenu();
assert.equal(chapterButtons.length, chapters.length);
chapterButtons[1].click();
assert.equal(harness.getState().chapter, 1, "a second replay selection should open its requested chapter");
assert.deepEqual(harness.getState().flags, originalState.flags, "switching replay chapters should restart from the original main snapshot");
assert.deepEqual(harness.getState().choices, originalState.choices, "replay choices should not leak between chapters");

harness.restart();
assert.equal(harness.getState().chapter, 1, "restarting replay should remain in its selected chapter");
assert.equal(harness.getState().flags.teamwork, originalState.flags.teamwork, "replay restart should preserve the replay copy's starting flags");
const writesBeforeRestartSave = writeCount;
harness.saveState();
assert.equal(writeCount, writesBeforeRestartSave, "replay restart should still block autosave writes");

harness.returnToMain();
assert.equal(harness.getReplay(), false, "returning should exit replay mode");
assert.deepEqual(harness.getState(), originalState, "returning should restore the exact main progress snapshot");
assert.equal(storageValues.get("autosave"), JSON.stringify(originalState), "replay should leave the persisted autosave unchanged");
assert.equal(storageValues.get("manual-slots"), manualSlotsRaw, "replay should leave persisted manual slots unchanged");
assert.equal(writeCount, 0, "chapter replay should not write any storage before returning to main");

console.log("Chapter replay isolation checks passed (chapter menu, local choices, autosave protection, restart, and main-state restoration).");
