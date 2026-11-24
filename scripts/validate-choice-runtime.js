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
  readFunction("choose", "restart"),
  readFunction("advanceLine", "currentLine")
].join("\n");
let renderCalls = 0;
let historyCalls = 0;
let confirmSoundCalls = 0;
const harness = new Function(
  "chapters",
  "renderHistory", "render", "playConfirmSound",
  "clearAutoAdvance", "revealCurrentLine", "startAmbient",
  "playChapterTransitionSound", "playRouteEndingSound",
`let state = {};\nlet dialogueHistory = [];\nlet lastHistoryKey = "";\n${runtimeFunctions}\nreturn {\n  choose, getSequence, advanceLine,\n  setState(value) { state = value; dialogueHistory = []; },\n  getState() { return state; }, getHistory() { return dialogueHistory; }\n};`
)(chapters, () => { historyCalls += 1; }, () => { renderCalls += 1; }, () => { confirmSoundCalls += 1; }, () => {}, () => false, () => {}, () => {}, () => {});

const baselineFlags = { rest: 3, teamwork: 2, ordinary_day: 1, daily_checkin: 4, self_rest: 1 };
const zeroFlags = Object.fromEntries(Object.keys(baselineFlags).map(flag => [flag, 0]));
let checkedConditionalGroups = 0;
for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
  const chapter = chapters[chapterIndex];
  for (const condition of chapter.flaggedIntro || []) {
    const groupLinesFor = value => (chapter.flaggedIntro || [])
      .filter(group => group.flag === condition.flag && group.min <= value)
      .flatMap(group => group.lines || [])
      .filter(line => Array.isArray(line) && String(line[1] || "").trim());
    const baseIntro = (chapter.intro || []).filter(line => Array.isArray(line) && String(line[1] || "").trim());
    const belowThreshold = condition.min - 1;
    const belowState = {
      version: 3,
      chapter: chapterIndex,
      phase: "intro",
      line: 0,
      choices: {},
      flags: { ...zeroFlags, [condition.flag]: belowThreshold },
      route: chapter.routeEnding || null
    };
    harness.setState(belowState);
    assert.deepEqual(
      harness.getSequence(),
      [...baseIntro, ...groupLinesFor(belowThreshold)],
      `${chapter.id} ${condition.flag} below ${condition.min} should not show this memory`
    );

    const reachedState = {
      ...belowState,
      flags: { ...zeroFlags, [condition.flag]: condition.min }
    };
    harness.setState(reachedState);
    assert.deepEqual(
      harness.getSequence(),
      [...baseIntro, ...groupLinesFor(condition.min)],
      `${chapter.id} ${condition.flag} at ${condition.min} should show its eligible memories`
    );
    checkedConditionalGroups += 1;
  }
}
assert.equal(checkedConditionalGroups, 21, "conditional intro coverage should include every memory group");
console.log(`Conditional intro checks passed (${checkedConditionalGroups} groups hide below and appear at their runtime thresholds).`);

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

let checkedChapterLifecycles = 0;
for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
  const chapter = chapters[chapterIndex];
  for (const choice of chapter.choices) {
    harness.setState({
      version: 3,
      chapter: chapterIndex,
      phase: "choice",
      line: 0,
      choices: {},
      flags: { ...baselineFlags },
      route: null
    });
    harness.choose(choice);

    const selectedState = harness.getState();
    const branchSequence = harness.getSequence();
    assert.ok(branchSequence.length > 0, `${chapter.id} ${choice.letter} should have playable branch dialogue`);
    selectedState.line = branchSequence.length - 1;
    harness.setState(selectedState);
    harness.advanceLine();
    assert.equal(harness.getState().chapter, chapterIndex, `${chapter.id} ${choice.letter} should stay in its chapter after branch dialogue`);
    assert.equal(harness.getState().phase, "common", `${chapter.id} ${choice.letter} should advance from branch to common`);
    assert.equal(harness.getState().line, 0, `${chapter.id} ${choice.letter} should begin common at line zero`);

    const beforeCommonExit = harness.getState();
    const commonSequence = harness.getSequence();
    assert.ok(commonSequence.length > 0, `${chapter.id} should have playable common dialogue`);
    beforeCommonExit.line = commonSequence.length - 1;
    harness.setState(beforeCommonExit);
    harness.advanceLine();

    const afterCommonExit = harness.getState();
    if (chapter.endOfRoute) {
      assert.equal(afterCommonExit.chapter, chapterIndex, `${chapter.id} should remain selected at its ending`);
      assert.equal(afterCommonExit.phase, "complete", `${chapter.id} should complete after common dialogue`);
    } else {
      const expectedNextId = chapter.nextByRoute
        ? (chapter.nextByRoute[afterCommonExit.route] || "D06")
        : chapters[chapterIndex + 1]?.id;
      assert.equal(chapters[afterCommonExit.chapter]?.id, expectedNextId, `${chapter.id} ${choice.letter} should enter its intended next chapter`);
      assert.equal(afterCommonExit.phase, "intro", `${expectedNextId} should start at intro`);
      assert.equal(afterCommonExit.line, 0, `${expectedNextId} should start at line zero`);
    }
    checkedChapterLifecycles += 1;
  }
}
assert.equal(checkedChapterLifecycles, 99, "chapter lifecycle coverage should exercise every selectable choice");
console.log(`Chapter lifecycle checks passed (${checkedChapterLifecycles} choice paths advance through branch and common to the expected destination).`);

const d06Index = chapters.findIndex(chapter => chapter.id === "D06");
const d07Index = chapters.findIndex(chapter => chapter.id === "D07");
const d06 = chapters[d06Index];
const d07 = chapters[d07Index];
const expectedRouteEndings = { friend: "D08F", partner: "D08P", romance: "D08R" };
assert.deepEqual(d07.nextByRoute, expectedRouteEndings, "D07 should keep the three intended route exits");
let checkedRouteCombinations = 0;

for (const d06Choice of d06.choices) {
  for (const d07Choice of d07.choices) {
    harness.setState({
      version: 3,
      chapter: d06Index,
      phase: "choice",
      line: 0,
      choices: {},
      flags: { ...baselineFlags },
      route: null
    });
    harness.choose(d06Choice);
    assert.equal(harness.getState().route, d06Choice.route, `D06 ${d06Choice.letter} should select its relationship route`);

    const beforeD07 = harness.getState();
    beforeD07.phase = "common";
    beforeD07.line = d06.common.filter(line => Array.isArray(line) && String(line[1] || "").trim()).length - 1;
    harness.setState(beforeD07);
    harness.advanceLine();
    assert.equal(harness.getState().chapter, d07Index, `D06 ${d06Choice.letter} should advance to D07`);
    assert.equal(harness.getState().route, d06Choice.route, `D06 ${d06Choice.letter} should retain its route into D07`);

    const atD07 = harness.getState();
    atD07.phase = "choice";
    atD07.line = 0;
    harness.setState(atD07);
    harness.choose(d07Choice);
    assert.equal(harness.getState().route, d06Choice.route, `D07 ${d07Choice.letter} should preserve the D06 route`);
    assert.deepEqual(harness.getState().choices.D07, d07Choice, `D07 ${d07Choice.letter} should persist its activity choice`);

    const beforeExit = harness.getState();
    beforeExit.phase = "common";
    beforeExit.line = d07.common.filter(line => Array.isArray(line) && String(line[1] || "").trim()).length - 1;
    harness.setState(beforeExit);
    harness.advanceLine();

    const afterExit = harness.getState();
    const expectedEndingId = expectedRouteEndings[d06Choice.route];
    assert.equal(chapters[afterExit.chapter]?.id, expectedEndingId, `D06 ${d06Choice.letter} + D07 ${d07Choice.letter} should enter ${expectedEndingId}`);
    assert.equal(chapters[afterExit.chapter]?.routeEnding, d06Choice.route, `${expectedEndingId} should match the selected D06 route`);
    assert.equal(afterExit.phase, "intro", `${expectedEndingId} should start at its intro`);
    assert.equal(afterExit.route, d06Choice.route, `${expectedEndingId} should retain the selected route`);
    checkedRouteCombinations += 1;
  }
}

assert.equal(checkedRouteCombinations, 9, "the route integration should cover all D06 × D07 choices");
console.log(`Route transition checks passed (${checkedRouteCombinations} D06/D07 choice combinations retain the intended ending route).`);
