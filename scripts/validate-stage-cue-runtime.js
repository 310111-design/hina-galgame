#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const stylesheet = fs.readFileSync(path.join(root, "site", "game.css"), "utf8");
const dataSource = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const prefix = "window.HINA_GAME_DATA = ";
assert.ok(dataSource.startsWith(prefix), "game-data.js has an unexpected format");
const chapters = JSON.parse(dataSource.slice(prefix.length).trim().replace(/;\s*$/, ""));

const cueFunction = source.match(/function setStageCue\(cue\)\s*\{[\s\S]*?\n\}/)?.[0];
assert.ok(cueFunction, "missing setStageCue runtime helper");
assert.match(cueFunction, /\["close", "wide"\]\.includes\(cue\)/);
assert.match(source, /function renderDialogue\(\[kind, text, mood, stageCue\]\)/);
assert.match(source, /setStageCue\(kind === "hina" \? stageCue : ""\)/);
const renderBody = source.match(/function render\(\)\s*\{([\s\S]*?)\n\}/)?.[1] || "";
assert.ok(renderBody.includes('setStageCue("")'), "choice/ending phases must clear a prior line's cue");

const stage = { dataset: {} };
const documentStub = {
  getElementById(id) {
    assert.equal(id, "gameStage");
    return stage;
  }
};
const setStageCue = new Function("document", `${cueFunction}\nreturn setStageCue;`)(documentStub);
setStageCue("close");
assert.equal(stage.dataset.stageCue, "close");
setStageCue("wide");
assert.equal(stage.dataset.stageCue, "wide");
setStageCue("mood-derived");
assert.equal(stage.dataset.stageCue, "");
setStageCue(undefined);
assert.equal(stage.dataset.stageCue, "");

assert.match(stylesheet, /scale:\s*calc\(var\(--sprite-scale, 1\) \* var\(--stage-cue-scale, 1\)\)/);
assert.match(stylesheet, /\.game-stage\[data-stage-cue="close"\] \.hina-sprite\s*\{\s*--stage-cue-scale:\s*1\.045;/);
assert.match(stylesheet, /\.game-stage\[data-stage-cue="wide"\] \.hina-sprite\s*\{\s*--stage-cue-scale:\s*\.97;/);
assert.match(stylesheet, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\.game-stage\[data-stage-cue\] \.hina-sprite\s*\{\s*--stage-cue-scale:\s*1;/s);

const dialogueArrays = [];
function collect(value) {
  if (Array.isArray(value)) {
    if (value.length >= 2 && ["hina", "narration", "system"].includes(value[0]) && typeof value[1] === "string") {
      dialogueArrays.push(value);
      return;
    }
    value.forEach(collect);
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach(collect);
  }
}
collect(chapters);
assert.ok(dialogueArrays.length > 0, "expected runtime dialogue tuples");
assert.ok(dialogueArrays.every(line => line.length <= 3), "existing prose should remain neutral until individually marked");

console.log("Stage-cue runtime OK: explicit close/wide marks only, one-line reset, reduced-motion neutral, current story unchanged.");
