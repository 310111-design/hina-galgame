#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { summarizeChapter } = require("./chapter-length-audit.js");

const root = path.join(__dirname, "..");
const dataSource = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(dataSource, sandbox);
const chapters = sandbox.window.HINA_GAME_DATA;

function fail(message) {
  throw new Error(message);
}

function format(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function allDialogue(chapter) {
  const regular = [
    ...(chapter.intro || []),
    ...(chapter.branches?.A || []),
    ...(chapter.branches?.B || []),
    ...(chapter.branches?.C || []),
    ...(chapter.common || [])
  ];
  const conditional = (chapter.flaggedIntro || []).flatMap(group => group.lines || []);
  return [...regular, ...conditional].map(line => line[1]);
}

const allText = chapters.flatMap(allDialogue);
const uniqueText = [...new Set(allText)];
const conditionalGroups = chapters.reduce((sum, chapter) => sum + (chapter.flaggedIntro || []).length, 0);
const conditionalCharacters = chapters.reduce((sum, chapter) => sum +
  (chapter.flaggedIntro || []).flatMap(group => group.lines || [])
    .reduce((subtotal, line) => subtotal + Array.from(line[1]).length, 0), 0);
const totalCharacters = allText.reduce((sum, text) => sum + Array.from(text).length, 0);
const uniqueCharacters = uniqueText.reduce((sum, text) => sum + Array.from(text).length, 0);

const commonChapters = chapters.filter(chapter => !chapter.endOfRoute);
const commonPathRanges = commonChapters.map(chapter => {
  const lengths = ["A", "B", "C"].map(letter => summarizeChapter(chapter).paths[letter].codePoints);
  return { min: Math.min(...lengths), max: Math.max(...lengths) };
});
const commonMin = commonPathRanges.reduce((sum, range) => sum + range.min, 0);
const commonMax = commonPathRanges.reduce((sum, range) => sum + range.max, 0);
const routeTotals = new Map();
for (const chapter of chapters.filter(item => item.endOfRoute)) {
  const paths = ["A", "B", "C"].map(letter => summarizeChapter(chapter).paths[letter].codePoints);
  routeTotals.set(chapter.routeEnding, {
    min: commonMin + Math.min(...paths),
    max: commonMax + Math.max(...paths)
  });
}

const routeRanges = [...routeTotals.values()];
const singleRouteCharacters = {
  min: Math.min(...routeRanges.map(range => range.min)),
  max: Math.max(...routeRanges.map(range => range.max))
};
const sharedTextPerRun = commonChapters.reduce((sum, chapter) => {
  const metrics = summarizeChapter(chapter);
  return sum + metrics.sections.intro.codePoints + metrics.sections.common.codePoints;
}, 0);
const allCommonBranchText = commonChapters.reduce((sum, chapter) => {
  const metrics = summarizeChapter(chapter);
  return sum + ["A", "B", "C"].reduce((subtotal, letter) => subtotal + metrics.sections[letter].codePoints, 0);
}, 0);
const endingPathRanges = chapters.filter(chapter => chapter.endOfRoute).map(chapter => {
  const paths = ["A", "B", "C"].map(letter => summarizeChapter(chapter).paths[letter].codePoints);
  return { min: Math.min(...paths), max: Math.max(...paths) };
});
// Three route playthroughs reread shared intros/common sections, cover A/B/C
// once across the 30 shared chapters, and take one path in each route ending.
const threeRouteReplayCharacters = {
  min: 3 * sharedTextPerRun + allCommonBranchText + endingPathRanges.reduce((sum, range) => sum + range.min, 0),
  max: 3 * sharedTextPerRun + allCommonBranchText + endingPathRanges.reduce((sum, range) => sum + range.max, 0)
};

function estimateHours(characters, charsPerMinute) {
  return characters / charsPerMinute / 60;
}

function formatHours(hours) {
  return hours.toFixed(1).replace(/\.0$/u, "");
}

function formatHourRange(characters) {
  return formatHours(estimateHours(characters.min, 400)) + "～" +
    formatHours(estimateHours(characters.max, 300));
}

function readLines(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8").split(/\r?\n/);
}

function requireLine(lines, predicate, label) {
  const line = lines.find(predicate);
  if (!line) fail(label + ": required summary line is missing");
  return line;
}

function requireText(line, text, label) {
  if (!line.includes(text)) fail(label + ": expected “" + text + "” in " + line.trim());
}

const plan = readLines("knowledge/plan.md");
const chapterPlan = readLines("knowledge/chapter-plan.md");
const lengthReview = fs.readFileSync(path.join(root, "knowledge", "reviews", "full-length-refresh.md"), "utf8");
const playtimeReview = fs.readFileSync(path.join(root, "knowledge", "reviews", "playtime-estimate.md"), "utf8");
const latestReviewMarker = "## 最新結果：";
const latestReviewStart = lengthReview.lastIndexOf(latestReviewMarker);
if (latestReviewStart < 0) fail("full-length-refresh.md: latest snapshot marker is missing");
const latestReview = lengthReview.slice(latestReviewStart);

const tupleCount = allText.length;
const uniqueCount = uniqueText.length;
const tupleText = `${format(tupleCount)} 條對話 tuple`;
const allCharacterText = `${format(totalCharacters)} 字元`;
const uniqueCharacterText = `${format(uniqueCharacters)} 字元`;
const uniqueCountText = `${format(uniqueCount)} 條唯一`;
const conditionalText = `${conditionalGroups} 組條件對話（${format(conditionalCharacters)} 字元）`;

const planPlaytime = requireLine(plan, line => line.startsWith("- 純文字閱讀時間仍無玩家計時"), "plan.md playtime estimate");
const chapterPlaytime = requireLine(chapterPlan, line => line.startsWith("- **純文字遊玩時間估算"), "chapter-plan.md playtime estimate");
for (const [label, line] of [["plan.md", planPlaytime], ["chapter-plan.md", chapterPlaytime]]) {
  requireText(line, format(singleRouteCharacters.min) + "～" + format(singleRouteCharacters.max) + " 字元", label + " single-route volume");
  requireText(line, formatHourRange(singleRouteCharacters) + " 小時", label + " single-route time");
  requireText(line, format(totalCharacters) + " 字元", label + " all-branch volume");
  requireText(line, formatHourRange({ min: totalCharacters, max: totalCharacters }) + " 小時", label + " all-branch time");
  requireText(line, format(threeRouteReplayCharacters.min) + "～" + format(threeRouteReplayCharacters.max) + " 字元", label + " three-route replay volume");
  requireText(line, formatHourRange(threeRouteReplayCharacters) + " 小時", label + " three-route replay time");
}
requireText(planPlaytime, "此重讀模型不含條件對話", "plan.md three-route replay scope");
requireText(chapterPlaytime, "此重讀模型不含條件對話", "chapter-plan.md three-route replay scope");
requireText(playtimeReview, "300～400 字元／分鐘", "playtime estimate reading-rate assumption");
for (const [label, range, volume] of [
  ["single route", singleRouteCharacters, format(singleRouteCharacters.min) + "～" + format(singleRouteCharacters.max)],
  ["all-branch coverage", { min: totalCharacters, max: totalCharacters }, format(totalCharacters)],
  ["three-route replay", threeRouteReplayCharacters, format(threeRouteReplayCharacters.min) + "～" + format(threeRouteReplayCharacters.max)]
]) {
  requireText(playtimeReview, volume + " 字元", "playtime estimate " + label + " volume");
  requireText(playtimeReview, formatHourRange(range) + " 小時", "playtime estimate " + label + " duration");
}
requireText(playtimeReview, "三路線完整重讀、不跳過共通內容", "playtime estimate replay scenario");
requireText(playtimeReview, "此重讀模型不含條件對話", "playtime estimate replay scope");

const planStats = requireLine(plan, line => line.startsWith("- 目前 33 個章節節點"), "plan.md global length");
const chapterStats = requireLine(chapterPlan, line => line.includes("**全分支內容統計"), "chapter-plan.md global length");
for (const [label, line] of [["plan.md", planStats], ["chapter-plan.md", chapterStats]]) {
  requireText(line, tupleText, label);
  requireText(line, allCharacterText, label);
  requireText(line, uniqueCharacterText, label);
  requireText(line, uniqueCountText, label);
}
requireText(planStats, `${conditionalGroups} 組條件對話`, "plan.md conditional group count");
requireText(planStats, `${conditionalGroups} 組條件台詞合計 ${format(conditionalCharacters)} 字元`, "plan.md conditional length");
requireText(chapterStats, conditionalText, "chapter-plan.md conditional summary");

const planRoutes = requireLine(plan, line => line.startsWith("5. **長篇規模"), "plan.md route totals");
const chapterRoutes = requireLine(chapterPlan, line => line.includes("**單次遊玩估算"), "chapter-plan.md route totals");
const latestRoutes = latestReview;
for (const [label, line] of [["plan.md", planRoutes], ["chapter-plan.md", chapterRoutes], ["full-length-refresh.md latest snapshot", latestRoutes]]) {
  requireText(line, `${format(routeTotals.get("friend").min)}～${format(routeTotals.get("friend").max)}`, label + " friend route");
  requireText(line, `${format(routeTotals.get("partner").min)}～${format(routeTotals.get("partner").max)}`, label + " partner route");
  requireText(line, `${format(routeTotals.get("romance").min)}～${format(routeTotals.get("romance").max)}`, label + " romance route");
}

const endingRows = new Map(chapterPlan
  .filter(line => /^\| D08[FPR] \|/.test(line))
  .map(line => [line.match(/^\| (D08[FPR]) \|/)[1], line]));
for (const chapter of chapters.filter(item => item.endOfRoute)) {
  const row = endingRows.get(chapter.id);
  if (!row) fail("chapter-plan.md ending row is missing for " + chapter.id);
  const metrics = summarizeChapter(chapter);
  const total = metrics.total.codePoints;
  const pathValues = ["A", "B", "C"].map(letter => metrics.paths[letter].codePoints);
  requireText(row, `${format(total)} 字元`, "chapter-plan.md " + chapter.id + " total");
  for (let index = 0; index < pathValues.length; index += 1) {
    requireText(row, `${"ABC"[index]} ${format(pathValues[index])}`, "chapter-plan.md " + chapter.id + " path");
  }
}

requireText(latestReview, `**${format(tupleCount)}** 條對話 tuple`, "full-length-refresh.md latest tuple count");
requireText(latestReview, `**${format(totalCharacters)}** 字元`, "full-length-refresh.md latest raw character count");
requireText(latestReview, `${format(uniqueCharacters)} 字元／${format(uniqueCount)} 條唯一文字`, "full-length-refresh.md latest unique character count");
requireText(latestReview, `${conditionalGroups} 組條件對話`, "full-length-refresh.md conditional group count");
requireText(latestReview, `${format(conditionalCharacters)} 字元`, "full-length-refresh.md conditional length");
requireText(latestReview, `${format(commonMin)}～${format(commonMax)}`, "full-length-refresh.md common route range");

console.log(`Full-story length summary OK: ${chapters.length} chapters, ${format(tupleCount)} tuples, ${format(uniqueCharacters)} unique characters, route ranges match plan and chapter plan.`);
