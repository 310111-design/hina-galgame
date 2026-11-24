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
  readFunction("loadManualSlots", "normalizeManualSave"),
  readFunction("normalizeManualSave", "isValidManualSave"),
  readFunction("isValidManualSave", "openSaveMenu")
].join("\n");
const createHarness = storage => new Function(
  "chapters", "localStorage", "MANUAL_SAVE_KEY", "MANUAL_SLOTS_KEY", "MANUAL_SLOT_COUNT",
  `${migrationFunctions}\nreturn { loadManualSlots, normalizeManualSave, isValidManualSave };`
)(chapters, storage, "legacy", "slots", 6);

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); }
  };
}

const harness = createHarness(memoryStorage());
const { normalizeManualSave, isValidManualSave } = harness;

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

const future = { version: 4, chapter: 3, phase: "intro", line: 0 };
assert.deepEqual(normalizeManualSave(future), future, "unknown future versions should not be migrated as old saves");
assert.equal(isValidManualSave(future), false, "unknown future versions should not load as current saves");

const singleLegacyStorage = memoryStorage({ legacy: JSON.stringify({ chapter: 0, phase: "intro", line: 0 }) });
const singleLegacySlots = createHarness(singleLegacyStorage).loadManualSlots();
assert.equal(chapters[singleLegacySlots[0].chapter].id, "A01", "single-slot legacy import should shift to A01");
assert.equal(singleLegacySlots[0].version, 3);

const migratedSlotsStorage = memoryStorage({
  slots: JSON.stringify([
    { chapter: 0, phase: "intro", line: 0 },
    { version: 2, chapter: 3, phase: "intro", line: 0 },
    current,
    future
  ])
});
const migratedSlotsHarness = createHarness(migratedSlotsStorage);
const migratedSlots = migratedSlotsHarness.loadManualSlots();
assert.equal(chapters[migratedSlots[0].chapter].id, "A01", "already-imported pre-prologue slots should shift to A01");
assert.equal(chapters[migratedSlots[1].chapter].id, "A01", "post-prologue v2 slots should keep their chapter index");
assert.equal(chapters[migratedSlots[2].chapter].id, "A01", "current slots should keep their chapter index");
assert.deepEqual(migratedSlots[3], future, "unsupported slots should remain intact for a future app version");
assert.equal(migratedSlotsHarness.loadManualSlots()[0].chapter, 3, "persisted migrations should not shift again");

console.log("Manual save migration regression checks passed (legacy, current and unsupported future formats).");
