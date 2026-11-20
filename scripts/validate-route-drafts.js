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
  { id: "D08F", minimum: 2500, status: "expanded draft" },
  { id: "D08P", minimum: 2500, status: "expanded draft" },
  { id: "D08R", minimum: 500, status: "first draft; expansion review pending" }
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
  const match = markdown.match(/正文統計[^0-9]*(\d+)/);
  if (!match) errors.push(target.id + ": missing declared character count in Markdown");
  else if (Number(match[1]) !== count) errors.push(target.id + ": Markdown count " + match[1] + " does not match game data " + count);
  if (count < target.minimum) errors.push(target.id + ": " + count + " characters below minimum " + target.minimum);
  console.log(target.id + ": " + count + " characters (including mutually exclusive branches) — " + target.status);
}

if (errors.length) {
  console.error("Route draft validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Route draft validation OK: game data and Markdown counts match.");
}
