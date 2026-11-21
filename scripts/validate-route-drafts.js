"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { runRegressionFixtures, auditChapter } = require("./chapter-length-audit.js");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const chapters = sandbox.window.HINA_GAME_DATA;
const errors = [];

const targets = [
  // Early drafts have no declared runtime count. Check dialogue only; do not
  // mistake the editorial character-count goal for measured metadata.
  { id: "A01", dialogueOnly: true, status: "continuity review; fixes pending" },
  { id: "A02", dialogueOnly: true, status: "continuity review; fixes pending" },
  { id: "A03", dialogueOnly: true, status: "continuity review; fixes pending" },
  { id: "A04", dialogueOnly: true, syncSections: true, status: "continuity review; fixes pending" },
  { id: "A05", dialogueOnly: true, syncSections: true, status: "continuity review; fixes pending" },
  { id: "A06", dialogueOnly: true, syncSections: true, status: "continuity review; fixes pending" },
  { id: "B01", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B06", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B07", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "B08", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C01", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C02", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C03", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C04", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "C05", dialogueOnly: true, syncSections: true, syncChoices: true, status: "continuity review; fixes pending" },
  { id: "D01", minimum: 2500, pathMinimum: 2500, syncDialogue: false, status: "revised draft" },
  { id: "D02", minimum: 2500, pathMinimum: 2500, syncDialogue: false, status: "revised draft" },
  { id: "D03", minimum: 2500, pathMinimum: 2500, syncDialogue: false, status: "revised draft" },
  { id: "D04", minimum: 2500, pathMinimum: 2500, status: "revised draft" },
  { id: "D05", minimum: 2500, pathMinimum: 2500, syncDialogue: false, status: "revised draft" },
  { id: "D06", minimum: 2500, pathMinimum: 2500, status: "route bridge draft" },
  { id: "D07", minimum: 2500, pathMinimum: 2500, status: "route bridge draft" },
  { id: "D08F", minimum: 2500, pathMinimum: 2500, status: "reviewed draft" },
  { id: "D08P", minimum: 2500, pathMinimum: 2500, status: "reviewed draft" },
  { id: "D08R", minimum: 2500, pathMinimum: 2500, status: "reviewed draft" }
];

function parseDialogue(markdown, target) {
  return markdown.split(/\r?\n/).flatMap(rawLine => {
    const line = rawLine.trim();
    if (!line) return [];
    let match = line.match(/^【旁白】(.*)$/);
    if (match) return [["narration", match[1]]];
    match = line.match(/^【陽奈｜([^】]+)】(.*)$/);
    // A01/A02 use standalone mood cues followed by explicit narration.
    // Those cues are not spoken lines in runtime. Keep adult checks strict.
    if (match) return target.dialogueOnly && !match[2] ? [] : [["hina", match[2], match[1]]];
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

// In-memory regression fixtures: no story files or runtime data are mutated.
const choiceFixture = "A. 先休息。\nB. 先交付。\nC. 先詢問。\n\n---\n";
const fixtureChoices = ["先休息。", "先交付。", "先詢問。"].map((label, index) => ({
  letter: "ABC"[index], label
}));
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
    compareDialogue(target.id, parseDialogue(dialogueMarkdown, target), lines);
    if (target.syncSections) compareSections(dialogueMarkdown, chapter, target);
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
