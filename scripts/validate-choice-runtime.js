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
  readFunction("getSequence", "revealCurrentLine"),
  readFunction("choose", "restart")
].join("\n");
let renderCalls = 0;
let historyCalls = 0;
let confirmSoundCalls = 0;
const harness = new Function(
  "chapters",
  "renderHistory", "render", "playConfirmSound",
  `let state = {};\nlet dialogueHistory = [];\nlet lastHistoryKey = "";\n${runtimeFunctions}\nreturn {\n  choose, getSequence,\n  setState(value) { state = value; dialogueHistory = []; },\n  getState() { return state; }, getHistory() { return dialogueHistory; }\n};`
)(chapters, () => { historyCalls += 1; }, () => { renderCalls += 1; }, () => { confirmSoundCalls += 1; });

const baselineFlags = { rest: 3, teamwork: 2, ordinary_day: 1, daily_checkin: 4, self_rest: 1 };
let checkedChoices = 0;
for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
  const chapter = chapters[chapterIndex];
  assert.equal(chapter.choices.length, 3, `${chapter.id} should provide three selectable choices`);
  for (const choice of chapter.choices) {
    const state = {
      version: 3,
      chapter: chapterIndex,
      phase: "choice",
      line: 0,
      choices: {},
      flags: { ...baselineFlags },
      route: null
    };
    const expectedFlags = { ...baselineFlags };
    if (choice.flag) expectedFlags[choice.flag] = (expectedFlags[choice.flag] || 0) + 1;
    if (chapter.id === "A06") expectedFlags.daily_checkin += 1;

    harness.setState(state);
    harness.choose(choice);

    const chosenState = harness.getState();
    assert.equal(chosenState.phase, "branch", `${chapter.id} ${choice.letter} should enter its branch`);
    assert.equal(chosenState.line, 0, `${chapter.id} ${choice.letter} should begin its branch at line zero`);
    assert.deepEqual(chosenState.flags, expectedFlags, `${chapter.id} ${choice.letter} should update only its intended flag(s)`);
    assert.deepEqual(chosenState.choices[chapter.id], choice, `${chapter.id} ${choice.letter} should persist the selected choice`);
    assert.equal(chosenState.route, choice.route || null, `${chapter.id} ${choice.letter} should set the intended route`);

    const expectedBranch = (chapter.branches[choice.letter] || []).filter(line => Array.isArray(line) && String(line[1] || "").trim());
    assert.deepEqual(harness.getSequence(), expectedBranch, `${chapter.id} ${choice.letter} should play the matching branch sequence`);
    assert.deepEqual(harness.getHistory().at(-1), { chapter: chapter.id, speaker: "你的選擇", text: choice.label });
    checkedChoices += 1;
  }
}

assert.equal(checkedChoices, 99, "runtime choice coverage should include all 33 chapters");
assert.equal(historyCalls, checkedChoices);
assert.equal(renderCalls, checkedChoices);
assert.equal(confirmSoundCalls, checkedChoices);
console.log(`Runtime choice checks passed (${checkedChoices} choices, flags, selected branches and route assignments).`);
