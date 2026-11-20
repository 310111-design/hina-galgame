#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const dataPath = path.join(__dirname, "..", "site", "game-data.js");
const source = fs.readFileSync(dataPath, "utf8");
const prefix = "window.HINA_GAME_DATA = ";

if (!source.startsWith(prefix)) {
  throw new Error("game-data.js must begin with: " + prefix);
}

const data = JSON.parse(source.slice(prefix.length).trim().replace(/;\s*$/, ""));
const expectedIds = [
  "P01", "P02", "P03",
  "A01", "A02", "A03", "A04", "A05", "A06",
  "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08",
  "C01", "C02", "C03", "C04", "C05", "C06",
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08F", "D08P", "D08R"
];
const defaultFlags = new Set([
  "rest", "teamwork", "ordinary_day", "daily_checkin", "self_rest"
]);
const routeKeys = new Set(["friend", "partner", "romance"]);
const errors = [];
let choiceCount = 0;
let branchCount = 0;
let conditionalGroupCount = 0;

function checkLines(lines, label) {
  if (!Array.isArray(lines) || lines.length === 0) {
    errors.push(label + ": sequence must be a non-empty array");
    return;
  }
  lines.forEach((line, index) => {
    if (!Array.isArray(line) || line.length < 2) {
      errors.push(label + "[" + index + "]: invalid dialogue tuple");
      return;
    }
    if (!["narration", "hina", "system"].includes(line[0])) {
      errors.push(label + "[" + index + "]: unknown speaker kind " + line[0]);
    }
    if (typeof line[1] !== "string" || !line[1].trim()) {
      errors.push(label + "[" + index + "]: dialogue text is empty");
    }
    if (line.length > 2 && typeof line[2] !== "string") {
      errors.push(label + "[" + index + "]: mood must be a string");
    }
  });
}

if (!Array.isArray(data)) {
  throw new Error("HINA_GAME_DATA must be an array");
}

const ids = data.map(chapter => chapter && chapter.id);
if (new Set(ids).size !== ids.length) {
  errors.push("chapter IDs must be unique");
}
if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
  errors.push("chapter order/IDs differ from expected A01-D07 list");
}

data.forEach(chapter => {
  const id = chapter?.id || "(missing id)";
  checkLines(chapter?.intro, id + ".intro");
  checkLines(chapter?.common, id + ".common");

  if (!Array.isArray(chapter?.choices) || chapter.choices.length !== 3) {
    errors.push(id + ": expected exactly 3 choices");
    return;
  }
  choiceCount += chapter.choices.length;

  const letters = chapter.choices.map(choice => choice?.letter);
  if (new Set(letters).size !== letters.length) {
    errors.push(id + ": choice letters must be unique");
  }

  const branchKeys = Object.keys(chapter.branches || {}).sort();
  if (JSON.stringify(branchKeys) !== JSON.stringify([...letters].sort())) {
    errors.push(id + ": branch keys must match choice letters");
  }

  chapter.choices.forEach(choice => {
    if (choice?.route !== undefined) {
      if (!routeKeys.has(choice.route)) errors.push(id + ": unknown route " + choice.route);
      if (id !== "D06") errors.push(id + ": route choices are only allowed in D06");
      if (choice.flag !== undefined) errors.push(id + ": route choices must not modify legacy story flags");
    } else if (!defaultFlags.has(choice?.flag)) {
      errors.push(id + ": unknown choice flag " + choice?.flag);
    }
    checkLines(chapter.branches?.[choice.letter], id + ".branches." + choice.letter);
    branchCount += 1;
  });

  if (chapter.nextByRoute !== undefined) {
    const keys = Object.keys(chapter.nextByRoute || {}).sort();
    if (JSON.stringify(keys) !== JSON.stringify([...routeKeys].sort())) errors.push(id + ": nextByRoute must map all three routes");
    Object.values(chapter.nextByRoute || {}).forEach(target => {
      const targetChapter = data.find(item => item.id === target);
      if (!targetChapter || !targetChapter.endOfRoute) errors.push(id + ": nextByRoute target must be an endOfRoute chapter");
      else if (targetChapter.routeEnding !== Object.entries(chapter.nextByRoute).find(([, value]) => value === target)?.[0]) errors.push(id + ": nextByRoute target routeEnding must match its route key");
    });
  }
  if (chapter.endOfRoute && !routeKeys.has(chapter.routeEnding)) errors.push(id + ": endOfRoute requires a valid routeEnding");
  if (chapter.endOfRoute && chapter.nextByRoute !== undefined) errors.push(id + ": route endings cannot branch to another route");
  if (id === "D06" && JSON.stringify(chapter.choices.map(choice => choice.route).sort()) !== JSON.stringify([...routeKeys].sort())) errors.push("D06 must offer all three explicit relationship routes");
  if (chapter.flaggedIntro !== undefined) {
    if (!Array.isArray(chapter.flaggedIntro)) {
      errors.push(id + ": flaggedIntro must be an array");
      return;
    }
    chapter.flaggedIntro.forEach((group, index) => {
      conditionalGroupCount += 1;
      if (!defaultFlags.has(group?.flag)) {
        errors.push(id + ".flaggedIntro[" + index + "]: unknown flag " + group?.flag);
      }
      if (!Number.isInteger(group?.min ?? 1) || (group.min ?? 1) < 1) {
        errors.push(id + ".flaggedIntro[" + index + "]: min must be a positive integer");
      }
      checkLines(group?.lines, id + ".flaggedIntro[" + index + "].lines");
    });
  }
});

if (errors.length) {
  console.error("Game data validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log(
    "Game data OK: " + data.length + " chapters, " +
    choiceCount + " choices, " + branchCount + " branches, " +
    conditionalGroupCount + " conditional groups."
  );
}
