"use strict";

// Read-only metrics shared by the fixed routes validator. Never rewrite drafts,
// runtime, metadata or documentation while validating.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

function textMetrics(texts) {
  return {
    tuples: texts.length,
    utf16: texts.reduce((sum, text) => sum + text.length, 0),
    codePoints: texts.reduce((sum, text) => sum + Array.from(text).length, 0),
    nonWhitespace: texts.reduce((sum, text) => sum + Array.from(text.replace(/\s/gu, "")).length, 0)
  };
}

function textsFrom(lines) {
  assert.ok(Array.isArray(lines), "Expected a dialogue array");
  return lines.map(line => {
    assert.ok(Array.isArray(line) && typeof line[1] === "string", "Expected dialogue text in tuple[1]");
    return line[1];
  });
}

function summarizeChapter(chapter) {
  const intro = textsFrom(chapter.intro);
  const common = textsFrom(chapter.common);
  const branches = Object.fromEntries(["A", "B", "C"].map(letter => [letter, textsFrom(chapter.branches[letter])]));
  const all = [...intro, ...branches.A, ...branches.B, ...branches.C, ...common];
  return {
    sections: Object.fromEntries(Object.entries({ intro, ...branches, common })
      .map(([name, texts]) => [name, textMetrics(texts)])),
    total: textMetrics(all),
    // Exact text deduplication: speaker/mood changes do not add unique text.
    // Do not normalize punctuation or count choice labels as spoken dialogue.
    uniqueText: textMetrics([...new Set(all)]),
    paths: Object.fromEntries(["A", "B", "C"].map(letter => [letter,
      textMetrics([...intro, ...branches[letter], ...common])])),
    conditional: textMetrics((chapter.flaggedIntro || []).flatMap(group => textsFrom(group.lines)))
  };
}

function runRegressionFixtures() {
  const fixture = {
    intro: [["narration", "甲😀"]], common: [["narration", "甲😀"]],
    branches: {
      A: [["narration", "乙。"]], B: [["hina", "甲😀", "微笑"]], C: [["narration", " 丙 "]]
    },
    choices: [{ label: "不算正文", hint: "也不算" }],
    flaggedIntro: [{ flag: "rest", min: 2, lines: [["narration", "旗標"]] }]
  };
  const result = summarizeChapter(fixture);
  assert.deepEqual(result.total, { tuples: 5, utf16: 14, codePoints: 11, nonWhitespace: 9 });
  assert.deepEqual(result.uniqueText, { tuples: 3, utf16: 8, codePoints: 7, nonWhitespace: 5 });
  assert.deepEqual(result.paths.A, { tuples: 3, utf16: 8, codePoints: 6, nonWhitespace: 6 });
  assert.deepEqual(result.paths.B, { tuples: 3, utf16: 9, codePoints: 6, nonWhitespace: 6 });
  assert.deepEqual(result.paths.C, { tuples: 3, utf16: 9, codePoints: 7, nonWhitespace: 5 });
  assert.deepEqual(result.conditional, { tuples: 1, utf16: 2, codePoints: 2, nonWhitespace: 2 });
  const changedLabels = { ...fixture, choices: [{ label: "任意增長的選項文字，不可影響正文長度" }] };
  assert.deepEqual(summarizeChapter(changedLabels), result);
  const withoutConditions = summarizeChapter({ ...fixture, flaggedIntro: [] });
  assert.deepEqual(withoutConditions.total, result.total);
  assert.deepEqual(withoutConditions.paths, result.paths);
  assert.equal(withoutConditions.conditional.tuples, 0);
  assert.throws(() => summarizeChapter({ ...fixture, intro: [["narration", null]] }), /dialogue text/);
  console.log("Length audit fixtures OK: Unicode, whitespace, exact-text deduplication, single paths, excluded choices/conditions and invalid tuple guard.");
}

function auditChapter(chapter, referenceMinimum = 2500) {
  assert.ok(chapter, "Missing chapter for length audit");
  const metrics = summarizeChapter(chapter);
  const digest = crypto.createHash("sha256").update(JSON.stringify(chapter)).digest("hex");
  console.log(chapter.id + " length audit (read-only; advisory reference " + referenceMinimum + "; not a quality gate):");
  console.log("  Chapter JSON SHA-256: " + digest);
  console.log("  Units: tuples / UTF-16 units / Unicode code points / non-whitespace code points; punctuation included.");
  const format = metric => [metric.tuples, metric.utf16, metric.codePoints, metric.nonWhitespace].join(" / ");
  for (const [name, metric] of Object.entries(metrics.sections)) console.log("  " + name + ": " + format(metric));
  console.log("  All branches, common counted once: " + format(metrics.total));
  console.log("  Exact unique dialogue text: " + format(metrics.uniqueText));
  for (const [letter, metric] of Object.entries(metrics.paths)) {
    console.log("  Path " + letter + ": " + format(metric) + "; reference gap=" + Math.max(0, referenceMinimum - metric.codePoints));
  }
  console.log("  Conditional dialogue (excluded above): " + format(metrics.conditional));
  return metrics;
}

module.exports = { summarizeChapter, runRegressionFixtures, auditChapter };
