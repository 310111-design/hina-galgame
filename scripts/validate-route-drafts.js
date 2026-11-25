"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { runRegressionFixtures, auditChapter } = require("./chapter-length-audit.js");
const targets = require("./route-draft-targets.js");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const chapters = sandbox.window.HINA_GAME_DATA;
const errors = [];

function parseDialogue(markdown, target) {
  return markdown.split(/\r?\n/).flatMap(rawLine => {
    const line = rawLine.trim();
    if (!line) return [];
    let match = line.match(/^【旁白】(.*)$/);
    if (match) return [["narration", match[1]]];
    match = line.match(/^【陽奈｜([^｜】]+)(?:｜(特寫|退遠))?】(.*)$/);
    // A01/A02 use standalone mood cues followed by explicit narration.
    // Those cues are not spoken lines in runtime. Keep adult checks strict.
    if (match) {
      if (target.dialogueOnly && !match[3]) return [];
      const tuple = ["hina", match[3], match[1]];
      if (match[2]) tuple.push(match[2] === "特寫" ? "close" : "wide");
      return [tuple];
    }
    match = line.match(/^【系統】(.*)$/);
    if (match) return [["system", match[1]]];
    if (
      line.startsWith("【") || line.startsWith("#") ||
      line.startsWith("**") || line.startsWith("-") ||
      /^[ABC]\./.test(line) || line.startsWith("`")
    ) return [];
    return [["narration", line]];
  });
}

function compareDialogue(label, expected, actual, issues = errors) {
  if (expected.length !== actual.length) {
    issues.push(label + ": Markdown dialogue line count " + expected.length + " does not match runtime " + actual.length);
  }
  const compareLength = Math.min(expected.length, actual.length);
  for (let index = 0; index < compareLength; index += 1) {
    if (JSON.stringify(expected[index]) !== JSON.stringify(actual[index])) {
      // Report only mismatched dialogue tuples, not the entire runtime file.
      issues.push(label + ": Markdown/runtime dialogue mismatch at line " + (index + 1) +
        "\n  Markdown: " + JSON.stringify(expected[index]) +
        "\n  runtime:  " + JSON.stringify(actual[index]));
    }
  }
}

// Only the text between the choice and branch-A markers is accepted. Never
// normalize punctuation or ignore malformed options: labels are player promises.
function choiceSyncErrors(block, choices) {
  const lines = block.split(/\r?\n/).map(line => line.trim())
    .filter(line => line && line !== "---");
  const parsed = lines.map(line => line.match(/^([ABC])\.\s+(.+)$/));
  if (parsed.length !== 3 || parsed.some(match => !match) ||
      parsed.map(match => match[1]).join("") !== "ABC") {
    return ["choice block must contain exactly A/B/C labels in order"];
  }
  const expected = parsed.map(match => [match[1], match[2]]);
  const actual = (choices || []).map(choice => [choice.letter, choice.label]);
  return JSON.stringify(expected) === JSON.stringify(actual)
    ? [] : ["Markdown/runtime choice letters or labels differ"];
}

function compareChoices(markdown, chapter, target, issues = errors) {
  const choiceMarker = "【選擇】";
  const choiceStart = markdown.indexOf(choiceMarker);
  const endMarker = target.choiceEndMarker || "【分支 A：";
  const choiceEnd = choiceStart < 0 ? -1 : markdown.indexOf(endMarker, choiceStart + choiceMarker.length);
  if (choiceStart < 0 || choiceEnd < 0) {
    issues.push(target.id + ": could not locate the complete choice block");
    return;
  }
  const block = markdown.slice(choiceStart + choiceMarker.length, choiceEnd);
  issues.push(...choiceSyncErrors(block, chapter.choices).map(error => target.id + ": " + error));
}

function conditionalSections(markdown, target) {
  const markers = [...markdown.matchAll(/^【條件對話：([a-z_]+)\s*>=\s*(\d+)】\s*$/gm)];
  return markers.map((marker, index) => {
    const start = marker.index + marker[0].length;
    let end = markdown.length;
    if (markers[index + 1]) end = markers[index + 1].index;
    else {
      const choice = markdown.indexOf("【選擇】", start);
      if (choice >= 0) end = choice;
    }
    return {
      flag: marker[1],
      min: Number(marker[2]),
      lines: parseDialogue(markdown.slice(start, end), target)
    };
  });
}

function stripConditionalSections(markdown) {
  const markers = [...markdown.matchAll(/^【條件對話：[a-z_]+\s*>=\s*\d+】\s*$/gm)];
  const ranges = markers.map((marker, index) => {
    const start = marker.index;
    let end = markdown.length;
    if (markers[index + 1]) end = markers[index + 1].index;
    else {
      const choice = markdown.indexOf("【選擇】", start);
      if (choice >= 0) end = choice;
    }
    return [start, end];
  });
  for (const [start, end] of ranges.reverse()) markdown = markdown.slice(0, start) + markdown.slice(end);
  return markdown;
}

function compareConditionalSections(markdown, chapter, target, issues = errors) {
  const actual = conditionalSections(markdown, target);
  const expected = (chapter.flaggedIntro || []).map(group => ({
    flag: group.flag, min: group.min, lines: group.lines
  }));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    issues.push(target.id + ": conditional manuscript dialogue, flags or thresholds differ from runtime");
  }
}

// In-memory regression fixtures: no story files or runtime data are mutated.
const choiceFixture = "A. 先休息。\nB. 先交付。\nC. 先詢問。\n\n---\n";
const fixtureChoices = ["先休息。", "先交付。", "先詢問。"].map((label, index) => ({
  letter: "ABC"[index], label
}));
assert.deepEqual(parseDialogue("【陽奈｜驚訝｜特寫】真的嗎？\n【陽奈｜認真｜退遠】先確認資料。", {}), [
  ["hina", "真的嗎？", "驚訝", "close"],
  ["hina", "先確認資料。", "認真", "wide"]
]);
assert.equal(choiceSyncErrors(choiceFixture, fixtureChoices).length, 0);
assert.equal(choiceSyncErrors(choiceFixture.replace(/\n/g, "\r\n"), fixtureChoices).length, 0);
for (const badBlock of [
  choiceFixture.replace("先休息。", "先工作。"),
  choiceFixture.replace("B.", "A."),
  choiceFixture.replace("B. 先交付。\n", ""),
  choiceFixture.replace("C. 先詢問。", "C. "),
  choiceFixture.replace("C.", "D."),
  choiceFixture + "A. 多一個選項。\n",
  choiceFixture.replace("B. 先交付。\nC. 先詢問。", "C. 先詢問。\nB. 先交付。")
]) assert.ok(choiceSyncErrors(badBlock, fixtureChoices).length > 0);
assert.ok(choiceSyncErrors(choiceFixture, [...fixtureChoices].reverse()).length > 0);
assert.ok(choiceSyncErrors(choiceFixture, undefined).length > 0);
console.log("Choice sync regression fixtures OK: 2 positive and 9 negative cases.");

// Opt in only for drafts with this exact section format. A flattened sequence
// cannot detect a line moved across intro/branch/common boundaries.
function compareSections(markdown, chapter, target, issues = errors) {
  const markers = [...markdown.matchAll(/^【(選擇|分支 [ABC]：[^】]+|共通回收)】\s*$/gm)];
  const names = markers.map(match => match[1].split("：")[0]);
  const expectedNames = ["選擇", "分支 A", "分支 B", "分支 C", "共通回收"];
  if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
    issues.push(target.id + ": missing, duplicate or out-of-order Markdown section markers");
    return;
  }
  if (target.syncChoices) {
    const block = markdown.slice(markers[0].index + markers[0][0].length, markers[1].index);
    issues.push(...choiceSyncErrors(block, chapter.choices).map(error => target.id + ": " + error));
  }
  const sections = [
    ["intro", markdown.slice(0, markers[0].index), chapter.intro || []],
    ...["A", "B", "C"].map((letter, index) => [
      "branch " + letter,
      markdown.slice(markers[index + 1].index + markers[index + 1][0].length, markers[index + 2].index),
      (chapter.branches || {})[letter] || []
    ]),
    ["common", markdown.slice(markers[4].index + markers[4][0].length), chapter.common || []]
  ];
  for (const [name, text, runtime] of sections) {
    compareDialogue(target.id + " " + name, parseDialogue(text, target), runtime, issues);
  }
}

// Exercise choice-block discovery for both route-style and prologue manuscript headings.
const choiceBlockIssues = [];
compareChoices("【選擇】\n" + choiceFixture + "【分支 A：休息】\n", { choices: fixtureChoices }, { id: "choice-fixture" }, choiceBlockIssues);
compareChoices("【選擇】\n" + choiceFixture + "## P02-A：休息\n", { choices: fixtureChoices }, { id: "choice-fixture", choiceEndMarker: "## P02-A" }, choiceBlockIssues);
assert.deepEqual(choiceBlockIssues, []);
const badChoiceBlockIssues = [];
compareChoices("【選擇】\n" + choiceFixture.replace("先交付", "先休息") + "【分支 A：休息】\n", { choices: fixtureChoices }, { id: "choice-fixture" }, badChoiceBlockIssues);
assert.ok(badChoiceBlockIssues.length > 0);
console.log("Choice block regression fixtures OK: route and prologue headings, including one mismatch.");

// Exercise the section parser, not just the flattened dialogue comparison.
// Each case has its own collector, so expected failures cannot hide real errors.
const sectionTarget = { id: "fixture", dialogueOnly: true, syncChoices: true };
const sectionFixture = "# fixture\n【旁白】入口。\n【選擇】\n" + choiceFixture +
  "【分支 A：甲】\n【陽奈｜認真】甲。\n【分支 B：乙】\n【旁白】乙。\n" +
  "【分支 C：丙】\n【旁白】丙。\n【共通回收】\n【旁白】收束。\n";
const sectionChapter = {
  intro: [["narration", "入口。"]], choices: fixtureChoices,
  branches: { A: [["hina", "甲。", "認真"]], B: [["narration", "乙。"]], C: [["narration", "丙。"]] },
  common: [["narration", "收束。"]]
};
for (const markdown of [sectionFixture, sectionFixture.replace(/\n/g, "\r\n")]) {
  const issues = [];
  compareSections(markdown, sectionChapter, sectionTarget, issues);
  assert.deepEqual(issues, []);
}
const movedLines = [
  ["intro to A", sectionFixture.replace("【旁白】入口。\n", "")
    .replace("【分支 A：甲】\n", "【分支 A：甲】\n【旁白】入口。\n"), "fixture intro:"],
  ["A to B", sectionFixture.replace("【陽奈｜認真】甲。\n【分支 B：乙】", "【分支 B：乙】\n【陽奈｜認真】甲。"), "fixture branch A:"],
  ["C to common", sectionFixture.replace("【旁白】丙。\n【共通回收】", "【共通回收】\n【旁白】丙。"), "fixture branch C:"]
];
for (const [name, markdown, diagnostic] of movedLines) {
  // Prove that a flattened-only check would miss these boundary mutations.
  assert.deepEqual(parseDialogue(markdown, sectionTarget), parseDialogue(sectionFixture, sectionTarget), name);
  const issues = [];
  compareSections(markdown, sectionChapter, sectionTarget, issues);
  assert.ok(issues.some(issue => issue.startsWith(diagnostic)), name);
}
for (const [name, markdown, diagnostic] of [
  ["missing marker", sectionFixture.replace("【共通回收】\n", ""), "section markers"],
  ["duplicate marker", sectionFixture + "【共通回收】\n", "section markers"],
  ["reordered markers", sectionFixture.replace("【分支 A：甲】", "【分支 B：甲】")
    .replace("【分支 B：乙】", "【分支 A：乙】"), "section markers"],
  ["speaker drift", sectionFixture.replace("【陽奈｜認真】甲。", "【旁白】甲。"), "dialogue mismatch"],
  ["mood drift", sectionFixture.replace("【陽奈｜認真】", "【陽奈｜微笑】"), "dialogue mismatch"]
]) {
  const issues = [];
  compareSections(markdown, sectionChapter, sectionTarget, issues);
  assert.ok(issues.some(issue => issue.includes(diagnostic)), name);
}
console.log("Section sync regression fixtures OK: 2 positive and 8 negative cases (3 preserve flattened dialogue).");

const conditionalFixture = "# fixture\n【條件對話：rest >= 1】\n【陽奈｜安心】先休息。\n\n【條件對話：teamwork >= 1】\n【陽奈｜認真】一起確認。\n\n【選擇】\n";
const conditionalTarget = { id: "conditional-fixture", dialogueOnly: true };
const conditionalChapter = { flaggedIntro: [
  { flag: "rest", min: 1, lines: [["hina", "先休息。", "安心"]] },
  { flag: "teamwork", min: 1, lines: [["hina", "一起確認。", "認真"]] }
] };
const conditionalIssues = [];
compareConditionalSections(conditionalFixture, conditionalChapter, conditionalTarget, conditionalIssues);
assert.deepEqual(conditionalIssues, []);
assert.deepEqual(parseDialogue(stripConditionalSections(conditionalFixture), conditionalTarget), []);
const badConditionalIssues = [];
compareConditionalSections(conditionalFixture.replace("teamwork >= 1", "teamwork >= 2"), conditionalChapter, conditionalTarget, badConditionalIssues);
assert.ok(badConditionalIssues.length > 0);
console.log("Conditional dialogue regression fixtures OK: two matched flags, main-text isolation, threshold mismatch.");

for (const target of targets) {
  const chapter = chapters.find(item => item.id === target.id);
  const markdownPath = path.join(root, "story", "chapters", target.id + ".md");

  if (!chapter) {
    errors.push("Missing game data chapter " + target.id);
    continue;
  }
  if (!fs.existsSync(markdownPath)) {
    errors.push("Missing Markdown draft " + target.id + ".md");
    continue;
  }

  const lines = [
    ...(chapter.intro || []),
    ...Object.values(chapter.branches || {}).flat(),
    ...(chapter.common || [])
  ];
  const count = lines.reduce((sum, line) => sum + String(line[1] || "").length, 0);
  const markdown = fs.readFileSync(markdownPath, "utf8");

  if (target.syncDialogue !== false) {
    const dialogueMarkdown = markdown
      .split(/^\s*(?:## 資料同步註記|【節末記錄】)\s*$/m)[0];
    const mainMarkdown = target.syncConditional ? stripConditionalSections(dialogueMarkdown) : dialogueMarkdown;
    compareDialogue(target.id, parseDialogue(mainMarkdown, target), lines);
    if (target.syncChoices && !target.syncSections) compareChoices(dialogueMarkdown, chapter, target);
    if (target.syncConditional) compareConditionalSections(dialogueMarkdown, chapter, target);
    if (target.syncSections) compareSections(mainMarkdown, chapter, target);
  }

  if (target.dialogueOnly) {
    console.log(target.id + ": " + lines.length + " dialogue tuples checked (intro/branches/common only; " +
      (target.syncSections ? "section boundaries checked; " : "") +
      (target.syncChoices ? "choice labels checked; " : "") + "no count threshold) — " + target.status);
    continue;
  }

  const match = markdown.match(/正文統計[^0-9]*([0-9,]+)\s*個中文字元/);
  if (!match) {
    errors.push(target.id + ": missing declared character count in Markdown");
  } else if (Number(match[1].replace(/,/g, "")) !== count) {
    errors.push(target.id + ": Markdown count " + match[1] + " does not match game data " + count);
  }
  if (count < target.minimum) {
    errors.push(target.id + ": " + count + " characters below minimum " + target.minimum);
  }

  const pathCounts = Object.entries(chapter.branches || {}).map(([letter, branch]) => {
    const pathCount = [...(chapter.intro || []), ...branch, ...(chapter.common || [])]
      .reduce((sum, line) => sum + String(line[1] || "").length, 0);
    if (pathCount < target.pathMinimum) {
      errors.push(target.id + " branch " + letter + ": " + pathCount + " characters below per-path minimum " + target.pathMinimum);
    }
    return letter + "=" + pathCount;
  });

  console.log(target.id + ": " + count + " total characters; paths " + pathCounts.join(", ") + " — " + target.status);
}

// Advisory inventory is separate from existing adult minimum gates. A passing
// sync check does not certify B05's narrative quality or reference length.
runRegressionFixtures();
auditChapter(chapters.find(chapter => chapter.id === "B05"));

if (errors.length) {
  console.error("Route draft validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Route draft validation OK: configured dialogue sync, character counts and per-path lengths pass.");
}
