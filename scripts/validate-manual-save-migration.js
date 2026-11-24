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
  `let manualSaveWriteBlocked = false;\nlet manualSaveWriteBlockedMessage = "";\n${migrationFunctions}\nreturn { loadManualSlots, normalizeManualSave, isValidManualSave, blocked: () => manualSaveWriteBlocked, message: () => manualSaveWriteBlockedMessage };`
)(chapters, storage, "legacy", "slots", 6);

function memoryStorage(initial = {}, unavailable = false) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      if (unavailable) throw new Error("localStorage unavailable");
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      if (unavailable) throw new Error("localStorage unavailable");
      values.set(key, String(value));
    },
    value(key) { return values.get(key); }
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

for (const [label, initial] of [
  ["malformed slot JSON", { slots: "{" }],
  ["unknown slot container", { slots: JSON.stringify({ version: 4, slots: [] }) }],
  ["more slots than supported", { slots: JSON.stringify(Array(7).fill(null)) }],
  ["corrupt individual slot", { slots: JSON.stringify([null, false, null, null, null, null]) }],
  ["unsupported individual slot", { slots: JSON.stringify([null, { version: 4, chapter: 3, phase: "intro", line: 0 }, null, null, null, null]) }],
  ["unsupported legacy slot", { legacy: JSON.stringify({ version: 4, chapter: 3, phase: "intro", line: 0 }) }]
]) {
  const storage = memoryStorage(initial);
  const protectedHarness = createHarness(storage);
  protectedHarness.loadManualSlots();
  assert.equal(protectedHarness.blocked(), true, `${label} should suspend manual-save writes`);
  const key = Object.hasOwn(initial, "slots") ? "slots" : "legacy";
  assert.equal(storage.value(key), initial[key], `${label} should remain unchanged in storage`);
}

const inaccessibleHarness = createHarness(memoryStorage({}, true));
inaccessibleHarness.loadManualSlots();
assert.equal(inaccessibleHarness.blocked(), true, "unavailable localStorage should block manual writes");

const oversizedContainer = [current, null, null, null, null, null, { version: 4, preserved: true }];
const oversizedStorage = memoryStorage({ slots: JSON.stringify(oversizedContainer) });
const loadManualSlotSource = readFunction("loadManualSlot", "saveManual");
const readableWhileBlockedHarness = new Function(
  "chapters", "localStorage", "MANUAL_SAVE_KEY", "MANUAL_SLOTS_KEY", "MANUAL_SLOT_COUNT",
  "document", "defaultState", "renderHistory", "render",
  `let manualSaveWriteBlocked = false;\nlet manualSaveWriteBlockedMessage = "";\nlet autoSaveWriteBlocked = true;\nlet autoSaveWriteBlockedMessage = "unknown data";\nlet replayMode = false;\nlet mainStateSnapshot = null;\nlet dialogueHistory = [];\nlet lastHistoryKey = "";\nlet state = {};\n${migrationFunctions}\n${loadManualSlotSource}\nreturn { loadManualSlots, loadManualSlot, state: () => state, blocked: () => manualSaveWriteBlocked };`
)(
  chapters, oversizedStorage, "legacy", "slots", 6,
  { getElementById() { return { close() {} }; } },
  () => ({ flags: {}, choices: {}, route: null }),
  () => {},
  () => {}
);
readableWhileBlockedHarness.loadManualSlot(0);
assert.equal(readableWhileBlockedHarness.state().chapter, current.chapter, "a valid slot among the first six should remain loadable while writes are blocked");
assert.equal(readableWhileBlockedHarness.state().phase, current.phase);
assert.equal(readableWhileBlockedHarness.blocked(), true, "loading a valid slot should not silently unblock container writes");
assert.equal(oversizedStorage.value("slots"), JSON.stringify(oversizedContainer), "reading a slot should not alter an oversized container");

const saveManualSlotSource = readFunction("saveManualSlot", "loadManualSlot");
const protectedWriteStorage = memoryStorage({ slots: "{" });
const protectedWriteHarness = new Function(
  "chapters", "localStorage", "MANUAL_SAVE_KEY", "MANUAL_SLOTS_KEY", "MANUAL_SLOT_COUNT",
  "document", "window", "state", "cloneState", "replayMode",
  `let manualSaveWriteBlocked = false;\nlet manualSaveWriteBlockedMessage = "";\n${migrationFunctions}\n${saveManualSlotSource}\nreturn { loadManualSlots, saveManualSlot, blocked: () => manualSaveWriteBlocked };`
)(
  chapters, protectedWriteStorage, "legacy", "slots", 6,
  { getElementById(id) { return id === "saveDialog" ? { close() {} } : { textContent: "" }; } },
  { confirm: () => true }, { version: 3, chapter: 3, phase: "intro", line: 0 }, value => value, false
);
protectedWriteHarness.loadManualSlots();
assert.equal(protectedWriteHarness.blocked(), true);
protectedWriteHarness.saveManualSlot(0);
assert.equal(protectedWriteStorage.value("slots"), "{", "saveManualSlot should not replace an unreadable slot container");

console.log("Manual save migration checks passed (legacy/current/future formats, corrupt-container preservation, write protection and safe reads).");
