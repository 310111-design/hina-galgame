#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const requiredIds = [...new Set([...source.matchAll(/getElementById\("([^"]+)"\)/g)].map(match => match[1]))];
const pages = ["game.html", "testplay.html"];
const errors = [];

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, "site", page), "utf8");
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
  console.log("Game shells OK: " + requiredIds.length + " JavaScript-required IDs exist exactly once in both pages.");
}
