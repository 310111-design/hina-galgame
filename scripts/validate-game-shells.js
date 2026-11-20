#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const requiredIds = [...new Set([...source.matchAll(/getElementById\("([^"]+)"\)/g)].map(match => match[1]))];
const pages = ["game.html", "testplay.html"];
const errors = [];
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
}

if (errors.length) {
  console.error("Game shell validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Game shells OK: " + requiredIds.length + " JavaScript-required IDs exist exactly once in both pages; sprite source is shared and present: " + pageSpriteSource + ".");
}
