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
const summariesSource = gameSource.match(/const choiceSummaries = \{[\s\S]*?\n\};/)?.[0];
assert.ok(summariesSource, "every chapter should define short summaries for its choices");
const choiceSummaries = new Function(`${summariesSource}\nreturn choiceSummaries;`)();
const noticeSource = gameSource.match(/function getChoiceNotice\(choice, chapterId\)\s*\{[\s\S]*?\n\}/)?.[0];
assert.ok(noticeSource, "choice presentation must disclose a route or later memory");
const getChoiceNotice = new Function("choiceSummaries", `${noticeSource}\nreturn getChoiceNotice;`)(choiceSummaries);
for (const [route, expected] of Object.entries({ friend: "朋友線", partner: "搭檔線", romance: "戀愛線" })) {
  assert.deepEqual(getChoiceNotice({ route, hint: expected }), {
    marker: expected.slice(0, 2),
    description: `路線告知：${expected}`
  }, `${route} choices should explicitly disclose their destination route`);
}
assert.deepEqual(getChoiceNotice({ hint: "休息" }), {
  marker: "休息",
  description: "後續回憶：休息"
}, "non-route choices should describe a remembered influence without claiming to lock a route");
assert.deepEqual(
  getChoiceNotice({ hint: "日常" }),
  { marker: "日常", description: "後續回憶：日常" },
  "choice tags should summarize the option in two or three characters"
);
assert.equal(Object.keys(choiceSummaries).length, chapters.length, "every chapter should have choice summary data");
for (const chapter of chapters) {
  assert.deepEqual(
    Object.keys(choiceSummaries[chapter.id] || {}).sort(),
    chapter.choices.map(choice => choice.letter).sort(),
    `${chapter.id} should summarize each available choice exactly once`
  );
  for (const choice of chapter.choices) {
    const marker = getChoiceNotice(choice, chapter.id).marker;
    assert.ok([...marker].length >= 2 && [...marker].length <= 3, `${chapter.id} choice ${choice.letter} should have a concise two- or three-character summary`);
    assert.equal(marker, choiceSummaries[chapter.id][choice.letter], `${chapter.id} choice ${choice.letter} should display its authored summary`);
  }
}
assert.equal(getChoiceNotice(chapters.find(chapter => chapter.id === "D01").choices[0], "D01").marker, "稱呼", "D01's name preference choice should be summarized by its actual action");
assert.equal(getChoiceNotice(chapters.find(chapter => chapter.id === "C03").choices[0], "C03").marker, "校園", "C03's school-memory choice should not inherit its later-memory category as the visible summary");
const reviewedSummaryContracts = {
  A03: { A: "休息" },
  A04: { B: "清單" },
  A05: { A: "休息" },
  B03: { C: "困難" },
  B05: { B: "初核" },
  B06: { C: "排程" },
  D02: { C: "做得好" },
  D05: { A: "認識" }
};
for (const [chapterId, choices] of Object.entries(reviewedSummaryContracts)) {
  for (const [letter, summary] of Object.entries(choices)) {
    assert.equal(choiceSummaries[chapterId][letter], summary, `${chapterId} ${letter} should keep its manually reviewed, action-based summary`);
  }
}
assert.match(gameSource, /marker\.textContent\s*=\s*notice\.marker/);
assert.match(gameSource, /hint\.textContent\s*=\s*notice\.description/);
assert.doesNotMatch(gameSource, /marker\.textContent\s*=\s*choice\.letter/);

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
const gameStage = {
  focusCount: 0,
  focus(options) {
    assert.equal(options?.preventScroll, true, "branch focus restoration should not scroll the page");
    this.focusCount += 1;
  }
};
const document = {
  getElementById(id) {
    if (id === "gameStage") return gameStage;
    throw new Error(`Unexpected element requested by choice runtime: ${id}`);
  }
};
const harness = new Function(
  "chapters",
  "document",
  "renderHistory", "render", "playConfirmSound",
  "clearAutoAdvance", "revealCurrentLine", "startAmbient",
  "playChapterTransitionSound", "playRouteEndingSound",
`let state = {};\nlet dialogueHistory = [];\nlet lastHistoryKey = "";\n${runtimeFunctions}\nreturn {\n  choose, getSequence, advanceLine,\n  setState(value) { state = value; dialogueHistory = []; },\n  getState() { return state; }, getHistory() { return dialogueHistory; },\n  getStageFocusCount() { return document.getElementById("gameStage").focusCount; }\n};`
)(chapters, document, () => { historyCalls += 1; }, () => { renderCalls += 1; }, () => { confirmSoundCalls += 1; }, () => {}, () => false, () => {}, () => {}, () => {});

function chooseAndExpectFocus(choice) {
  gameStage.focusCount = 0;
  harness.choose(choice);
  assert.equal(harness.getStageFocusCount(), 1, "choosing a branch should return focus to the game stage");
}

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
    chooseAndExpectFocus(choice);

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
    chooseAndExpectFocus(choice);

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
    chooseAndExpectFocus(d06Choice);
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
    chooseAndExpectFocus(d07Choice);
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

const endingByRoute = { friend: "D08F", partner: "D08P", romance: "D08R" };
const d07ChoicesByRoute = { friend: 0, partner: 1, romance: 2 };
const expectedFullPathPrefix = chapters.slice(0, d06Index + 1).map(chapter => chapter.id);
assert.equal(expectedFullPathPrefix.at(-1), "D06", "the linear full-path prefix should reach the explicit route choice");
assert.equal(chapters[d06Index + 1]?.id, "D07", "D06 should lead directly to the shared D07 activity chapter");

let checkedFullRoutePaths = 0;
for (const [route, endingId] of Object.entries(endingByRoute)) {
  const endingIndex = chapters.findIndex(chapter => chapter.id === endingId);
  assert.ok(endingIndex > d07Index, `${endingId} should follow the shared route bridge`);
  const expectedPath = [...expectedFullPathPrefix, "D07", endingId];
  const d07ChoiceIndex = d07ChoicesByRoute[route];
  const visited = [];
  let visitIndex = 0;
  const expectedFlags = { ...zeroFlags };

  harness.setState({
    version: 3,
    chapter: 0,
    phase: "intro",
    line: 0,
    choices: {},
    flags: { ...zeroFlags },
    route: null
  });

  function advanceCurrentSequenceToBoundary(expectedPhase) {
    const current = harness.getState();
    const sequence = harness.getSequence();
    const chapter = chapters[current.chapter];
    assert.ok(sequence.length > 0, `${chapter.id} ${current.phase} should have playable lines on the full ${route} path`);
    current.line = sequence.length - 1;
    harness.setState(current);
    harness.advanceLine();
    assert.equal(harness.getState().phase, expectedPhase, `${chapter.id} should advance from its last ${current.phase} line to ${expectedPhase}`);
  }

  while (harness.getState().phase !== "complete") {
    const beforeIntro = harness.getState();
    const chapterIndex = beforeIntro.chapter;
    const chapter = chapters[beforeIntro.chapter];
    assert.equal(chapter.id, expectedPath[visitIndex], `the full ${route} route should visit its expected chapter at step ${visitIndex + 1}`);
    assert.equal(beforeIntro.phase, "intro", `${chapter.id} should enter through its intro on the full ${route} route`);

    const introSequence = harness.getSequence();
    for (const condition of chapter.flaggedIntro || []) {
      const shouldAppear = (beforeIntro.flags[condition.flag] || 0) >= (condition.min || 1);
      for (const line of condition.lines || []) {
        if (!Array.isArray(line) || !String(line[1] || "").trim()) continue;
        assert.equal(
          introSequence.includes(line),
          shouldAppear,
          `${chapter.id} should ${shouldAppear ? "include" : "omit"} its ${condition.flag} memory at threshold ${condition.min} on the full ${route} route`
        );
      }
    }

    advanceCurrentSequenceToBoundary("choice");
    const atChoice = harness.getState();
    const selected = chapter.id === "D06"
      ? chapter.choices.find(choice => choice.route === route)
      : chapter.id === "D07"
        ? chapter.choices[d07ChoiceIndex]
        : chapter.choices[0];
    assert.ok(selected, `${chapter.id} should offer the expected choice on the full ${route} route`);
    chooseAndExpectFocus(selected);
    const afterChoice = harness.getState();
    if (selected.flag) expectedFlags[selected.flag] += 1;
    if (chapter.id === "A06") expectedFlags.daily_checkin += 1;
    const expectedRoute = chapter.id === "D06" ? route : atChoice.route;
    assert.equal(afterChoice.route, expectedRoute, `${chapter.id} should preserve the full ${route} route assignment`);
    assert.deepEqual(afterChoice.flags, expectedFlags, `${chapter.id} should retain cumulatively selected flags on the full ${route} route`);

    advanceCurrentSequenceToBoundary("common");
    const beforeCommonExit = harness.getState();
    assert.equal(beforeCommonExit.route, expectedRoute, `${chapter.id} common dialogue should retain accumulated route state`);
    advanceCurrentSequenceToBoundary(chapter.endOfRoute ? "complete" : "intro");

    visited.push(chapter.id);
    visitIndex += 1;
    const afterCommonExit = harness.getState();
    if (!chapter.endOfRoute) {
      const expectedNextId = chapter.nextByRoute
        ? (chapter.nextByRoute[afterCommonExit.route] || "D06")
        : chapters[chapterIndex + 1]?.id;
      assert.equal(chapters[afterCommonExit.chapter]?.id, expectedNextId, `${chapter.id} should advance to its intended next chapter on the full ${route} route`);
    }
  }

  const finished = harness.getState();
  assert.deepEqual(visited, expectedPath, `the full ${route} route should traverse every expected chapter through ${endingId}`);
  assert.equal(visitIndex, expectedPath.length, `the full ${route} route should end after the expected number of chapters`);
  assert.equal(chapters[finished.chapter]?.id, endingId, `the full ${route} route should finish at ${endingId}`);
  assert.equal(chapters[finished.chapter]?.routeEnding, route, `${endingId} should match the selected route`);
  assert.equal(finished.route, route, `${endingId} should retain the route selected at D06`);
  assert.equal(finished.phase, "complete", `${endingId} should reach the complete phase after common dialogue`);
  assert.equal(Object.keys(finished.choices).length, expectedPath.length, `${route} should retain one choice from every visited chapter`);
  assert.deepEqual(finished.flags, expectedFlags, `${route} should finish with every flag accumulated from its full path`);
  checkedFullRoutePaths += 1;
}

assert.equal(checkedFullRoutePaths, 3, "the full-route integration should complete all three relationship routes");
console.log(`Full route checks passed (${checkedFullRoutePaths} P01-to-ending paths retain chapter, choice, flag and conditional-memory state).`);
