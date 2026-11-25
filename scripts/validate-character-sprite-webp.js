#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.join(__dirname, "..");
const characterDir = path.join(root, "site", "assets", "characters");
const gameSource = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const spriteBlock = gameSource.match(/const EMOTION_SPRITES = \{([\s\S]*?)\n\};/);
if (!spriteBlock) throw new Error("Unable to find EMOTION_SPRITES in site/game.js");
const runtimePaths = [...new Set([...spriteBlock[1].matchAll(/"(assets\/characters\/hina-expression-[^" ]+\.webp)"/g)].map(match => match[1]))].sort();
assert.equal(runtimePaths.length, 13, "runtime should use all 13 expression variants");
const frameBlock = gameSource.match(/const SPRITE_FRAME_NORMALIZATION = (\{[\s\S]*?\n\});/);
if (!frameBlock) throw new Error("Unable to find SPRITE_FRAME_NORMALIZATION in site/game.js");
const frameNormalization = Object.fromEntries([...frameBlock[1].matchAll(/"([^"]+\.webp)": \{ contentHeight: (\d+), contentBottom: (\d+) \}/g)]
  .map(([, name, contentHeight, contentBottom]) => [name, { contentHeight: Number(contentHeight), contentBottom: Number(contentBottom) }]));
const referenceHeight = Number(gameSource.match(/const SPRITE_REFERENCE_HEIGHT = (\d+);/)?.[1]);
const referenceBottom = Number(gameSource.match(/const SPRITE_REFERENCE_BOTTOM = (\d+);/)?.[1]);
const frameHeight = Number(gameSource.match(/const SPRITE_FRAME_HEIGHT = (\d+);/)?.[1]);
assert.equal(Object.keys(frameNormalization).length, 13, "every expression should have one measured alpha frame");
for (const runtimePath of runtimePaths) {
  const name = path.basename(runtimePath);
  const frame = frameNormalization[name];
  assert.ok(frame, `${name} should have a visual-size calibration`);
  assert.ok(frame.contentHeight > 0 && frame.contentBottom > 0 && frame.contentBottom <= frameHeight, `${name} should have valid alpha bounds`);
  const scale = referenceHeight / frame.contentHeight;
  const normalizedBottom = frameHeight - (frameHeight - frame.contentBottom) * scale;
  const baselineShiftPercent = ((frameHeight - frame.contentBottom) * scale - (frameHeight - referenceBottom)) / frameHeight * 100;
  const alignedBottom = normalizedBottom + baselineShiftPercent / 100 * frameHeight;
  assert.ok(Math.abs(frame.contentHeight * scale - referenceHeight) < 0.001, `${name} visible height should normalize to the shared reference`);
  assert.ok(Math.abs(alignedBottom - referenceBottom) < 0.001, `${name} visible baseline should normalize to the shared reference`);
}

function pngDimensions(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), colorType: buffer[25] };
}

function pngAlphaBounds(buffer) {
  const { width, height, colorType } = pngDimensions(buffer);
  assert.equal(buffer[24], 8, "sprite PNG bit depth should be 8");
  assert.equal(colorType, 6, "sprite PNG should be RGBA");
  assert.equal(buffer[28], 0, "sprite PNG should not be interlaced");
  const idat = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    const kind = buffer.toString("ascii", offset + 4, offset + 8);
    if (kind === "IDAT") idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
    if (kind === "IEND") break;
  }

  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  let previous = Buffer.alloc(stride);
  let minY = height;
  let maxY = -1;
  let inputOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset++];
    const row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[inputOffset++];
      const left = x >= 4 ? row[x - 4] : 0;
      const up = y > 0 ? previous[x] : 0;
      const upperLeft = y > 0 && x >= 4 ? previous[x - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const estimate = left + up - upperLeft;
        const leftDistance = Math.abs(estimate - left);
        const upDistance = Math.abs(estimate - up);
        const upperLeftDistance = Math.abs(estimate - upperLeft);
        predictor = leftDistance <= upDistance && leftDistance <= upperLeftDistance
          ? left
          : upDistance <= upperLeftDistance ? up : upperLeft;
      } else assert.equal(filter, 0, `unsupported PNG scanline filter ${filter}`);
      row[x] = (raw + predictor) & 255;
      if (x % 4 === 3 && row[x] > 0) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    previous = row;
  }
  assert.ok(maxY >= minY, "sprite PNG should contain visible pixels");
  return { contentHeight: maxY - minY + 1, contentBottom: maxY + 1 };
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
  assert.deepEqual(pngAlphaBounds(source), frameNormalization[path.basename(pngPath).replace(/\.png$/i, ".webp")], `${path.basename(pngPath)} alpha bounds should match its display calibration`);
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
    style: {
      properties: new Map(),
      setProperty(name, value) { this.properties.set(name, value); },
      removeProperty(name) { this.properties.delete(name); }
    },
    onload: null,
    onerror: null,
    set src(value) { this.currentSrc = value; assignedSources.push(value); }
  };
  const setEmotion = new Function(
    "document", "EMOTION_SPRITES", "SPRITE_FALLBACK", "SPRITE_FRAME_NORMALIZATION",
    "SPRITE_FRAME_HEIGHT", "SPRITE_REFERENCE_HEIGHT", "SPRITE_REFERENCE_BOTTOM",
    `${setSpriteEmotionSource}\nreturn setSpriteEmotion;`
  )(
    { getElementById: () => sprite },
    { 微笑: runtimePaths.find(item => item.endsWith("hina-expression-smile.webp")) },
    "assets/hina-sprite.svg", frameNormalization, frameHeight, referenceHeight, referenceBottom
  );
  return { setEmotion, sprite, classes, assignedSources };
}

const supportedWebp = createSpriteHarness();
supportedWebp.setEmotion("微笑");
assert.equal(supportedWebp.assignedSources[0].endsWith("hina-expression-smile.webp"), true);
assert.equal(supportedWebp.sprite.style.properties.get("--sprite-scale"), "0.9714", "expression should get the measured size normalization");
assert.equal(supportedWebp.sprite.style.properties.get("--sprite-baseline-shift"), "-1.3524%", "expression should align to the shared baseline");
supportedWebp.sprite.onload();
assert.equal(supportedWebp.sprite.dataset.ready, "true", "loaded WebP should finish the sprite transition");

const fallbackHarness = createSpriteHarness();
fallbackHarness.setEmotion("微笑");
fallbackHarness.sprite.onerror();
assert.equal(fallbackHarness.assignedSources[1].endsWith("hina-expression-smile.png"), true, "failed WebP should retry the original PNG");
fallbackHarness.sprite.onerror();
assert.equal(fallbackHarness.assignedSources[2], "assets/hina-sprite.svg", "failed PNG should fall back to SVG");
assert.equal(fallbackHarness.sprite.dataset.emotion, "", "fallback should allow a later retry");
assert.equal(fallbackHarness.sprite.style.properties.has("--sprite-scale"), false, "SVG fallback should clear expression-specific normalization");
assert.equal(fallbackHarness.sprite.style.properties.has("--sprite-baseline-shift"), false, "SVG fallback should clear expression-specific baseline alignment");
const cssSource = fs.readFileSync(path.join(root, "site", "game.css"), "utf8");
assert.match(cssSource, /scale:\s*calc\(var\(--sprite-scale, 1\)\s*\*\s*var\(--stage-cue-scale, 1\)\)/, "CSS should compose calibrated sprite size with explicit stage cues independently of pose transforms");
assert.match(cssSource, /translate:\s*0 var\(--sprite-baseline-shift, 0%\)/, "CSS should apply calibrated baseline alignment independently of pose transforms");

console.log(`Character sprite checks passed (${runtimePaths.length} calibrated transparent frames, lossless WebP variants, PNG retry and SVG fallback).`);
