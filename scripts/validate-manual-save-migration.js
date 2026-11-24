#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const gameSource = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const dataSource = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const prefix = "window.HINA_GAME_DATA = ";
if (!dataSource.startsWith(prefix)) throw new Error("game-data.js has an unexpected format");
const chapters = JSON.parse(dataSource.slice(prefix.length).trim().replace(/;\s*$/, ""));

function readFunction(name, nextName) {
  const start = gameSource.indexOf(`function ${name}(`);
  const end = gameSource.indexOf(`\nfunction ${nextName}(`, start);
  if (start < 0 || end < 0) throw new Error(`Unable to find ${name} in site/game.js`);
  return gameSource.slice(start, end);
}

const migrationFunctions = [
  readFunction("normalizeManualSave", "isValidManualSave"),
  readFunction("isValidManualSave", "openSaveMenu")
].join("\n");
const { normalizeManualSave } = new Function("chapters", `${migrationFunctions}\nreturn { normalizeManualSave };`)(chapters);

const prePrologueA01 = normalizeManualSave({ chapter: 0, phase: "intro", line: 0 });
assert.equal(chapters[prePrologueA01.chapter].id, "A01", "pre-prologue saves should shift past P01–P03");
assert.equal(prePrologueA01.version, 3, "migrated saves should be marked current to make migration idempotent");

const prePrologueD07 = normalizeManualSave({ chapter: 26, phase: "complete", line: 0 });
assert.equal(chapters[prePrologueD07.chapter].id, "D07", "the old final chapter should retain its chapter identity");

const postPrologueA01 = normalizeManualSave({ version: 2, chapter: 3, phase: "intro", line: 0 });
assert.equal(chapters[postPrologueA01.chapter].id, "A01", "version 2 saves already use prologue-aware chapter indexes");
assert.equal(postPrologueA01.version, 3);

const current = { version: 3, chapter: 3, phase: "intro", line: 0 };
assert.deepEqual(normalizeManualSave(current), current, "current saves should remain unchanged");

console.log("Manual save migration regression checks passed (pre- and post-prologue formats).");
