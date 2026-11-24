#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const requiredIds = [...new Set([...source.matchAll(/getElementById\("([^"]+)"\)/g)].map(match => match[1]))];
const pages = ["game.html", "testplay.html"];
const errors = [];
if (!/function announceDialogue\(text\)\s*\{[^}]*storyAnnouncement[^}]*\}/s.test(source)) {
  errors.push("Missing completed-line screen-reader announcement helper.");
}
if (!/typingLine\.node\.textContent = typingLine\.characters\.slice\(0, typingLine\.index\)\.join\(""\);\s*if \(typingLine\.index >= typingLine\.characters\.length\)\s*\{\s*announceDialogue\(typingLine\.announcementText\);/s.test(source)) {
  errors.push("Completed dialogue lines must be announced after typewriter output finishes.");
}
if (!/function revealCurrentLine\(\)\s*\{[^}]*announceDialogue\(typingLine\.announcementText\)/s.test(source)) {
  errors.push("Revealing a partially typed line must announce the full dialogue once.");
}
if (!/function skipReadContent\(\)\s*\{[\s\S]*?suppressDialogueAnnouncements = true;[\s\S]*?finally\s*\{\s*suppressDialogueAnnouncements = false;/s.test(source)) {
  errors.push("Read-skip must suppress announcements for skipped dialogue.");
}
const backgroundMap = source.match(/const BACKGROUND_BY_CHAPTER = \{([\s\S]*?)\n\};/);
if (!backgroundMap) {
  errors.push("Missing BACKGROUND_BY_CHAPTER mapping.");
} else {
  const backgroundFiles = [...backgroundMap[1].matchAll(/"([^"]+\.(?:webp|jpe?g))"/gi)].map(match => match[1]);
  const roofOverride = source.match(/const backgroundFile = roofScene \? "([^"]+)"/);
  if (roofOverride) backgroundFiles.push(roofOverride[1]);
  [...new Set(backgroundFiles)].forEach(file => {
    if (!file.toLowerCase().endsWith(".webp")) errors.push("Runtime background must use WebP: " + file);
    if (!fs.existsSync(path.join(root, "site", "assets", "backgrounds", file))) {
      errors.push("Missing runtime background asset: " + file);
    }
  });
}
let pageSpriteSource = "";

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, "site", page), "utf8");
  const spriteIdIndex = html.indexOf('id="hinaSprite"');
  const spriteTagStart = spriteIdIndex >= 0 ? html.lastIndexOf("<img", spriteIdIndex) : -1;
  const spriteTagEnd = spriteTagStart >= 0 ? html.indexOf(">", spriteTagStart) : -1;
  const spriteTag = spriteTagEnd >= 0 ? html.slice(spriteTagStart, spriteTagEnd + 1) : "";
  const srcMarker = 'src="';
  const srcStart = spriteTag.indexOf(srcMarker);
  const srcEnd = srcStart >= 0 ? spriteTag.indexOf('"', srcStart + srcMarker.length) : -1;
  const spriteSource = srcEnd >= 0 ? spriteTag.slice(srcStart + srcMarker.length, srcEnd) : "";
  if (!spriteSource) {
    errors.push(page + ": missing hinaSprite image source");
  } else {
    const spritePath = path.join(root, "site", spriteSource);
    if (!fs.existsSync(spritePath)) errors.push(page + ": missing hinaSprite asset " + spriteSource);
    if (pageSpriteSource && pageSpriteSource !== spriteSource) errors.push(page + ": hinaSprite source differs from the other page shell");
    pageSpriteSource = spriteSource;
  }
  const ids = [...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]);
  const idSet = new Set(ids);
  const missing = requiredIds.filter(id => !idSet.has(id));
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (missing.length) errors.push(page + ": missing JS-required IDs: " + missing.join(", "));
  if (duplicates.length) errors.push(page + ": duplicate IDs: " + duplicates.join(", "));
  const storyTag = html.match(/<div\b(?=[^>]*\bid="story")[^>]*>/i)?.[0] || "";
  if (!storyTag || /\baria-live\s*=/i.test(storyTag)) {
    errors.push(page + ": typewriter story must stay outside live regions to avoid partial-line announcements");
  }
  if (!/<div\b(?=[^>]*\bid="storyAnnouncement")(?=[^>]*\baria-live="polite")(?=[^>]*\baria-atomic="true")[^>]*>/i.test(html)) {
    errors.push(page + ": missing atomic polite live region for completed dialogue lines");
  }
}

if (errors.length) {
  console.error("Game shell validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Game shells and runtime backgrounds OK: " + requiredIds.length + " JavaScript-required IDs exist exactly once in both pages; sprite source is shared and present: " + pageSpriteSource + ".");
}
