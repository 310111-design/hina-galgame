"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const chapters = sandbox.window.HINA_GAME_DATA;
const errors = [];

const targets = [
  { id: "D06", minimum: 2500, pathMinimum: 2500, status: "route bridge draft" },
  { id: "D07", minimum: 2500, pathMinimum: 2500, status: "route bridge draft" },
  { id: "D08F", minimum: 2500, pathMinimum: 2500, status: "reviewed draft" },
  { id: "D08P", minimum: 2500, pathMinimum: 2500, status: "reviewed draft" },
  { id: "D08R", minimum: 2500, pathMinimum: 2500, status: "reviewed draft" }
];

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

  const markdownDialogue = markdown.split(/\r?\n/).flatMap(rawLine => {
    const line = rawLine.trim();
    let match = line.match(/^【旁白】(.*)$/);
    if (match) return [["narration", match[1]]];
    match = line.match(/^【陽奈｜([^】]+)】(.*)$/);
    if (match) return [["hina", match[2], match[1]]];
    match = line.match(/^【系統】(.*)$/);
    if (match) return [["system", match[1]]];
    return [];
  });

  if (markdownDialogue.length !== lines.length) {
    errors.push(target.id + ": Markdown dialogue line count " + markdownDialogue.length + " does not match runtime " + lines.length);
  }
  const compareLength = Math.min(markdownDialogue.length, lines.length);
  for (let index = 0; index < compareLength; index += 1) {
    if (JSON.stringify(markdownDialogue[index]) !== JSON.stringify(lines[index])) {
      errors.push(target.id + ": Markdown/runtime dialogue mismatch at line " + (index + 1));
      break;
    }
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

if (errors.length) {
  console.error("Route draft validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Route draft validation OK: Markdown dialogue, character counts and per-path lengths match game data.");
}
