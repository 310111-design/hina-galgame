#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const characterDir = path.join(root, "site", "assets", "characters");
const gameSource = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const spriteBlock = gameSource.match(/const EMOTION_SPRITES = \{([\s\S]*?)\n\};/);
if (!spriteBlock) throw new Error("Unable to find EMOTION_SPRITES in site/game.js");
const runtimePaths = [...new Set([...spriteBlock[1].matchAll(/"(assets\/characters\/hina-expression-[^" ]+\.webp)"/g)].map(match => match[1]))].sort();
assert.equal(runtimePaths.length, 13, "runtime should use all 13 expression variants");

function pngDimensions(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), colorType: buffer[25] };
}

function losslessWebpInfo(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF");
  assert.equal(buffer.toString("ascii", 8, 12), "WEBP");
  assert.equal(buffer.toString("ascii", 12, 16), "VP8L", "runtime sprite variants should use lossless WebP");
  assert.equal(buffer[20], 0x2f, "lossless WebP signature should be present");
  const widthBits = buffer[21];
  const heightBits = buffer[22];
  const extraBits = buffer[23];
  const alphaAndVersion = buffer[24];
  return {
    width: 1 + widthBits + ((heightBits & 0x3f) << 8),
    height: 1 + ((heightBits >> 6) & 0x03) + (extraBits << 2) + ((alphaAndVersion & 0x0f) << 10),
    hasAlpha: (alphaAndVersion & 0x10) !== 0
  };
}

for (const runtimePath of runtimePaths) {
  const webpPath = path.join(root, "site", runtimePath);
  const pngPath = webpPath.replace(/\.webp$/i, ".png");
  assert.ok(fs.existsSync(webpPath), `missing runtime WebP: ${runtimePath}`);
  assert.ok(fs.existsSync(pngPath), `missing original PNG fallback: ${path.basename(pngPath)}`);
  const source = fs.readFileSync(pngPath);
  const variant = fs.readFileSync(webpPath);
  assert.deepEqual(pngDimensions(source), { width: 896, height: 1200, colorType: 6 }, `${path.basename(pngPath)} should remain the original 896×1200 RGBA source`);
  assert.deepEqual(losslessWebpInfo(variant), { width: 896, height: 1200, hasAlpha: true }, `${path.basename(webpPath)} should preserve sprite dimensions and alpha`);
  assert.ok(variant.length < source.length, `${path.basename(webpPath)} should be smaller than its PNG fallback`);
}

const spriteFunctionStart = gameSource.indexOf("function setSpriteEmotion(");
const spriteFunctionEnd = gameSource.indexOf("\nfunction updateScene(", spriteFunctionStart);
if (spriteFunctionStart < 0 || spriteFunctionEnd < 0) throw new Error("Unable to find setSpriteEmotion in site/game.js");
const setSpriteEmotionSource = gameSource.slice(spriteFunctionStart, spriteFunctionEnd);

function createSpriteHarness() {
  const classes = new Set();
  const assignedSources = [];
  const sprite = {
    dataset: {},
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); }
    },
    onload: null,
    onerror: null,
    set src(value) { this.currentSrc = value; assignedSources.push(value); }
  };
  const setEmotion = new Function(
    "document", "EMOTION_SPRITES", "SPRITE_FALLBACK",
    `${setSpriteEmotionSource}\nreturn setSpriteEmotion;`
  )({ getElementById: () => sprite }, { 微笑: runtimePaths.find(item => item.endsWith("hina-expression-smile.webp")) }, "assets/hina-sprite.svg");
  return { setEmotion, sprite, classes, assignedSources };
}

const supportedWebp = createSpriteHarness();
supportedWebp.setEmotion("微笑");
assert.equal(supportedWebp.assignedSources[0].endsWith("hina-expression-smile.webp"), true);
supportedWebp.sprite.onload();
assert.equal(supportedWebp.sprite.dataset.ready, "true", "loaded WebP should finish the sprite transition");

const fallbackHarness = createSpriteHarness();
fallbackHarness.setEmotion("微笑");
fallbackHarness.sprite.onerror();
assert.equal(fallbackHarness.assignedSources[1].endsWith("hina-expression-smile.png"), true, "failed WebP should retry the original PNG");
fallbackHarness.sprite.onerror();
assert.equal(fallbackHarness.assignedSources[2], "assets/hina-sprite.svg", "failed PNG should fall back to SVG");
assert.equal(fallbackHarness.sprite.dataset.emotion, "", "fallback should allow a later retry");

console.log(`Character sprite checks passed (${runtimePaths.length} pixel-preserving lossless WebP variants, PNG retry and SVG fallback).`);
