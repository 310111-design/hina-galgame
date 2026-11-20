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
  errors.push("chapter order/IDs differ from expected P01-D08R route-aware sequence");
}

const expectedRouteTargets = { friend: "D08F", partner: "D08P", romance: "D08R" };
const routeEndings = data.filter(chapter => chapter?.endOfRoute);
if (JSON.stringify(routeEndings.map(chapter => chapter.id)) !== JSON.stringify(["D08F", "D08P", "D08R"])) {
  errors.push("route ending chapters must be exactly D08F, D08P, D08R in sequence");
}
const routeEndingByKey = new Map(routeEndings.map(chapter => [chapter.routeEnding, chapter.id]));
if (routeEndingByKey.size !== 3) {
  errors.push("each relationship route must have exactly one unique ending");
}
const d07 = data.find(chapter => chapter?.id === "D07");
if (!d07 || JSON.stringify(d07.nextByRoute || {}) !== JSON.stringify(expectedRouteTargets)) {
  errors.push("D07 must route friend/partner/romance to D08F/D08P/D08R respectively");
}
const d05 = data.find(chapter => chapter?.id === "D05");
const d06 = data.find(chapter => chapter?.id === "D06");
const d05TeaInvitation = "下週如果你有空，要不要來我住處喝茶？";
if (!d05?.common?.some(line => String(line[1] || "").includes(d05TeaInvitation))) {
  errors.push("D05 must establish the home-tea invitation that leads into D06");
}
if (
  !d06?.intro?.some(line => String(line[1] || "").includes("確認你們剛才談到的下週見面安排")) ||
  !d06?.intro?.some(line => String(line[1] || "").includes("一起喝茶"))
) {
  errors.push("D06 must confirm the home-tea invitation established in D05, not repeat it as a new invitation");
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
  if (id !== "D06" && chapter.choices.some(choice => choice?.route !== undefined)) errors.push(id + ": relationship route selection must remain at D06");
  if (chapter.endOfRoute && routeEndingByKey.get(chapter.routeEnding) !== id) errors.push(id + ": routeEnding must be unique and match its route key");
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


// Every non-ending choice flag must be consumed by a later conditional memory line.
data.forEach((chapter, chapterIndex) => {
  if (chapter?.endOfRoute) return;
  (chapter.choices || []).forEach(choice => {
    if (!choice?.flag) return;
    const hasLaterDialogue = data.slice(chapterIndex + 1).some(laterChapter =>
      (laterChapter.flaggedIntro || []).some(group => group.flag === choice.flag)
    );
    if (!hasLaterDialogue) {
      errors.push(chapter.id + ": choice flag " + choice.flag + " has no later conditional dialogue response");
    }
  });
});

const flagDialoguePath = path.join(__dirname, "..", "knowledge", "flag-dialogue.md");
if (!fs.existsSync(flagDialoguePath)) {
  errors.push("Missing knowledge/flag-dialogue.md");
} else {
  const flagDocument = fs.readFileSync(flagDialoguePath, "utf8");
  const documentedGroups = new Map();
  let currentChapterId = null;
  let currentGroup = null;

  flagDocument.split(/\r?\n/).forEach(line => {
    const heading = line.match(/^## ([A-Z]\d{2}[A-Z]?)(?:：.*)?$/);
    if (heading) {
      currentChapterId = heading[1];
      if (!documentedGroups.has(currentChapterId)) documentedGroups.set(currentChapterId, []);
      currentGroup = null;
      return;
    }
    if (/^##\s/.test(line)) {
      currentChapterId = null;
      currentGroup = null;
      return;
    }
    const condition = line.match(/^\s*-\s*\*\*條件：\*\*\s*`([a-z_]+)\s*>=\s*(\d+)`/);
    if (condition && currentChapterId) {
      currentGroup = {
        flag: condition[1],
        min: Number(condition[2]),
        lines: []
      };
      documentedGroups.get(currentChapterId).push(currentGroup);
      return;
    }
    if (!currentGroup) return;
    let dialogue = line.match(/^\s*-\s*【旁白】(.*)$/);
    if (dialogue) {
      currentGroup.lines.push(["narration", dialogue[1]]);
      return;
    }
    dialogue = line.match(/^\s*-\s*【陽奈｜([^】]+)】(.*)$/);
    if (dialogue) {
      currentGroup.lines.push(["hina", dialogue[2], dialogue[1]]);
      return;
    }
    dialogue = line.match(/^\s*-\s*【系統】(.*)$/);
    if (dialogue) currentGroup.lines.push(["system", dialogue[1]]);
  });

  const documentedIds = [...documentedGroups.entries()]
    .filter(([, groups]) => groups.length > 0)
    .map(([id]) => id)
    .sort();
  const runtimeGroups = data.filter(chapter => Array.isArray(chapter.flaggedIntro) && chapter.flaggedIntro.length > 0);
  const runtimeIds = runtimeGroups.map(chapter => chapter.id).sort();

  if (JSON.stringify(documentedIds) !== JSON.stringify(runtimeIds)) {
    errors.push("flag-dialogue.md chapter IDs do not match runtime flaggedIntro chapters");
  }
  runtimeGroups.forEach(chapter => {
    const documented = documentedGroups.get(chapter.id) || [];
    if (JSON.stringify(documented) !== JSON.stringify(chapter.flaggedIntro)) {
      errors.push(chapter.id + ": flag-dialogue.md groups do not match runtime flaggedIntro");
    }
  });
  const documentedCount = [...documentedGroups.values()].reduce((sum, groups) => sum + groups.length, 0);
  if (documentedCount !== conditionalGroupCount) {
    errors.push("flag-dialogue.md has " + documentedCount + " groups; runtime has " + conditionalGroupCount);
  }
}

const siteDir = path.join(__dirname, "..", "site");
const gameSource = fs.readFileSync(path.join(siteDir, "game.js"), "utf8");

function readStaticMap(name) {
  const prefix = "const " + name + " = {";
  const start = gameSource.indexOf(prefix);
  if (start < 0) {
    errors.push("game.js: missing " + name + " map");
    return [];
  }
  const end = gameSource.indexOf("\n};", start);
  if (end < 0) {
    errors.push("game.js: unterminated " + name + " map");
    return [];
  }
  const body = gameSource.slice(start + prefix.length, end);
  return body.split(",").map(entry => entry.trim()).filter(Boolean).map(entry => {
    const colon = entry.indexOf(":");
    if (colon < 0) return null;
    const id = entry.slice(0, colon).trim();
    const rawValue = entry.slice(colon + 1).trim();
    return { id, value: rawValue.slice(1, -1) };
  }).filter(item => item && /^[A-Z0-9]+$/.test(item.id));
}

const sceneEntries = readStaticMap("SCENE_BY_CHAPTER");
const allowedScenes = new Set(["office", "corridor", "rooftop", "cafe", "home", "outdoor"]);
const sceneIds = new Set(sceneEntries.map(item => item.id));
sceneEntries.forEach(item => {
  if (!ids.includes(item.id)) errors.push("SCENE_BY_CHAPTER: unknown chapter " + item.id);
  if (!allowedScenes.has(item.value)) errors.push("SCENE_BY_CHAPTER: unknown scene type " + item.value);
});
data.forEach(chapter => {
  if (!sceneIds.has(chapter.id)) errors.push("SCENE_BY_CHAPTER: missing scene for " + chapter.id);
});

const backgroundEntries = readStaticMap("BACKGROUND_BY_CHAPTER");
const backgroundIds = new Set(backgroundEntries.map(item => item.id));
const backgroundFallbackIds = new Set([]);
backgroundEntries.forEach(item => {
  if (!ids.includes(item.id)) errors.push("BACKGROUND_BY_CHAPTER: unknown chapter " + item.id);
  const filePath = path.join(siteDir, "assets", "backgrounds", item.value);
  if (!fs.existsSync(filePath)) errors.push("BACKGROUND_BY_CHAPTER: missing asset " + item.value + " for " + item.id);
});
data.forEach(chapter => {
  if (!backgroundIds.has(chapter.id) && !backgroundFallbackIds.has(chapter.id)) {
    errors.push("BACKGROUND_BY_CHAPTER: missing mapping for " + chapter.id + " without an approved visual fallback");
  }
});
if (!fs.existsSync(path.join(siteDir, "assets", "backgrounds", "rooftop-sunset-v01.jpeg"))) {
  errors.push("P01/P02 rooftop branch override: missing rooftop-sunset-v01.jpeg");
}


if (errors.length) {
  console.error("Game data validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log(
    "Game data OK: " + data.length + " chapters, " +
    choiceCount + " choices, " + branchCount + " branches, " +
    conditionalGroupCount + " conditional groups and " + backgroundEntries.length + " chapter backgrounds."
  );
}
