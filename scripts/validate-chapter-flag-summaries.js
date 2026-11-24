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
let checked = 0;
let skipped = 0;

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

  if (!entry || !record) {
    assert.notEqual(chapter.id, "P03", "P03: entry and end-record flag metadata must remain auditable");
    skipped += 1;
    continue;
  }

  const entryFlags = extractFlags(entry[1]);

  const outputFlags = (chapter.choices || []).map(({ flag }) => flag).filter(Boolean);
  const expected = [...new Set([
    ...entryFlags,
    ...outputFlags,
    ...(additionalChoiceFlags.get(chapter.id) || [])
  ])].sort();
  const recorded = extractFlags(record[1]).sort();
  assert.equal(
    JSON.stringify(recorded),
    JSON.stringify(expected),
    `${chapter.id}: end-record flags must match entry and possible choice-output flags`
  );
  checked += 1;
}

assert.ok(checked > 0, "expected at least one chapter with auditable flag metadata");
console.log(`Chapter flag summaries OK: ${checked} chapters checked; ${skipped} chapters without both metadata fields left outside this check.`);
