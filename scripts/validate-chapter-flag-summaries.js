"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const chapters = sandbox.window.HINA_GAME_DATA;

// Every A06 choice also establishes the recurring check-in opportunity.
const additionalChoiceFlags = new Map([["A06", ["daily_checkin"]]]);
// These are mutually exclusive endings; their outputs must not flow into a sibling ending.
const terminalEndings = new Set(["D08F", "D08P", "D08R"]);
const reachableFlags = new Set();
let checkedEntries = 0;
let checkedEndRecords = 0;
let skippedEntries = 0;
let skippedEndRecords = 0;

function extractFlags(text) {
  return [...text.matchAll(/`([^`]+)`/g)].map(([, flag]) => flag);
}

for (const chapter of chapters) {
  const markdownPath = path.join(root, "story", "chapters", `${chapter.id}.md`);
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const entry = markdown.match(/^\*\*旗標(?:入口|摘要)：\*\* (.+)$/m);
  const recordIndex = markdown.lastIndexOf("【節末記錄】");
  const record = recordIndex < 0
    ? null
    : markdown.slice(recordIndex).match(/^- 旗標：(.+)$/m);

  const expectedEntry = [...reachableFlags].sort();
  if (entry) {
    const entryFlags = extractFlags(entry[1]).sort();
    assert.equal(
      JSON.stringify(entryFlags),
      JSON.stringify(expectedEntry),
      `${chapter.id}: entry flags must include every flag reachable from prior chapter choices`
    );
    checkedEntries += 1;
  } else {
    assert.notEqual(chapter.id, "P03", "P03: entry flag metadata must remain auditable");
    skippedEntries += 1;
  }

  const outputFlags = (chapter.choices || []).map(({ flag }) => flag).filter(Boolean);
  const expectedEnd = [...new Set([
    ...reachableFlags,
    ...outputFlags,
    ...(additionalChoiceFlags.get(chapter.id) || [])
  ])].sort();
  if (record) {
    const recorded = extractFlags(record[1]).sort();
    assert.equal(
      JSON.stringify(recorded),
      JSON.stringify(expectedEnd),
      `${chapter.id}: end-record flags must include prior flags, choice outputs and fixed engine increments`
    );
    checkedEndRecords += 1;
  } else {
    assert.notEqual(chapter.id, "P03", "P03: end-record flag metadata must remain auditable");
    skippedEndRecords += 1;
  }

  if (!terminalEndings.has(chapter.id)) {
    for (const flag of expectedEnd) reachableFlags.add(flag);
  }
}

assert.ok(checkedEntries > 0, "expected at least one chapter with auditable entry metadata");
assert.ok(checkedEndRecords > 0, "expected at least one chapter with auditable end-record metadata");
console.log(
  `Chapter flag summaries OK: ${checkedEntries} entry summaries and ${checkedEndRecords} end records checked; ` +
  `${skippedEntries} entries and ${skippedEndRecords} end records without metadata left outside this check.`
);
