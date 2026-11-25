#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game.js"), "utf8");
const stylesheet = fs.readFileSync(path.join(root, "site", "game.css"), "utf8");
const requiredIds = [...new Set([...source.matchAll(/getElementById\("([^"]+)"\)/g)].map(match => match[1]))];
const pages = ["game.html", "testplay.html"];
const errors = [];
const reducedMotionToastRule = [...stylesheet.matchAll(/\.chapter-toast\.is-visible\s*\{([^}]*)\}/g)].at(-1)?.[1] || "";
if (!/animation:\s*chapterToastReduced 2\.4s linear both/.test(reducedMotionToastRule) ||
    !/animation-duration:\s*2\.4s\s*!important/.test(reducedMotionToastRule)) {
  errors.push("Reduced-motion chapter toast must keep its opacity-only cue visible for its intended 2.4 seconds.");
}
const reducedToastStart = stylesheet.indexOf("@keyframes chapterToastReduced");
const reducedToastEnd = stylesheet.indexOf("\n}", reducedToastStart);
const reducedToastKeyframes = reducedToastStart >= 0 && reducedToastEnd > reducedToastStart
  ? stylesheet.slice(reducedToastStart, reducedToastEnd)
  : "";
if (!/opacity\s*:/.test(reducedToastKeyframes) || /\btransform\s*:/.test(reducedToastKeyframes)) {
  errors.push("Reduced-motion chapter toast should fade by opacity only, without spatial movement.");
}
const choiceFocusRule = [...stylesheet.matchAll(/\.game-stage\[data-phase="choice"\]\s+\.choice:focus-visible\s*\{([^}]*)\}/g)]
  .map(match => match[1])
  .at(-1) || "";
const choiceFocusColor = choiceFocusRule.match(/\boutline\s*:\s*2px solid\s+#([\da-f]{6})/i)?.[1];
let choiceFocusContrast = 0;
if (!choiceFocusColor) {
  errors.push("Choice buttons must keep a visible 2px keyboard-focus outline over the image-backed frame.");
} else {
  const foreground = [0, 2, 4].map(index => Number.parseInt(choiceFocusColor.slice(index, index + 2), 16));
  const darkestDialogueSurface = [11, 9, 19]; // #0b0913, the dark endpoint behind the image-backed frame.
  const luminance = color => {
    const [red, green, blue] = color.map(channel => channel / 255).map(value =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const surfaceLuminance = luminance(darkestDialogueSurface);
  const outlineLuminance = luminance(foreground);
  choiceFocusContrast = (Math.max(surfaceLuminance, outlineLuminance) + 0.05) /
    (Math.min(surfaceLuminance, outlineLuminance) + 0.05);
  if (choiceFocusContrast < 3) {
    errors.push("Choice keyboard-focus outline contrast is " + choiceFocusContrast.toFixed(2) + ":1 against #0b0913; expected at least 3:1.");
  }
}
const expectedToolbarActions = ["log", "auto", "skip", "save", "load", "config"];
const toolbarDispatch = source.match(/const targetIds = \{([^}]+)\}/)?.[1] || "";
for (const [action, target] of Object.entries({ log: "logToggle", auto: "autoPlayToggle", skip: "skipRead", save: "saveManual", load: "loadManual" })) {
  if (!new RegExp(`\\b${action}:\\s*"${target}"`).test(toolbarDispatch)) {
    errors.push("Toolbar action " + action + " must call the existing " + target + " control.");
  }
}
if (!source.includes('if (action === "config")') || !source.includes("toggleHistory(true)")) {
  errors.push("Toolbar settings action must open the existing reading-settings panel.");
}
if (!source.includes("String(readingSettings.autoPlay)")) {
  errors.push("Toolbar auto-play state must reflect the saved runtime setting.");
}
if (!source.includes("if (toolbarSkip) toolbarSkip.disabled = !canSkip")) {
  errors.push("Toolbar skip disabled state must match the existing read-skip control.");
}
const uiAssetSpecs = new Map([
  ["choice-layout-source.png", [1375, 768]],
  ["dialogue-layout-source.png", [1376, 768]],
  ["choice-prompt.png", [930, 150]],
  ["choice-row-default.png", [930, 125]],
  ["choice-row-selected.png", [930, 125]],
  ["dialogue-frame.png", [1118, 285]],
  ["dialogue-frame-cutout.png", [1118, 285]]
]);
function paethPredictor(left, up, upperLeft) {
  const estimate = left + up - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= upDistance && leftDistance <= upperLeftDistance) return left;
  return upDistance <= upperLeftDistance ? up : upperLeft;
}
function readRgbaPixel(bytes, x, y) {
  let width = 0;
  let height = 0;
  let colorType = -1;
  let bitDepth = -1;
  let interlace = -1;
  const idat = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  if (colorType !== 6 || bitDepth !== 8 || interlace !== 0 || x < 0 || y < 0 || x >= width || y >= height) return null;
  const decoded = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  let previous = Buffer.alloc(stride);
  let cursor = 0;
  for (let rowIndex = 0; rowIndex <= y; rowIndex += 1) {
    const filter = decoded[cursor++];
    const row = Buffer.from(decoded.subarray(cursor, cursor + stride));
    cursor += stride;
    for (let index = 0; index < stride; index += 1) {
      const left = index >= 4 ? row[index - 4] : 0;
      const up = previous[index];
      const upperLeft = index >= 4 ? previous[index - 4] : 0;
      if (filter === 1) row[index] = (row[index] + left) & 0xff;
      else if (filter === 2) row[index] = (row[index] + up) & 0xff;
      else if (filter === 3) row[index] = (row[index] + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) row[index] = (row[index] + paethPredictor(left, up, upperLeft)) & 0xff;
      else if (filter !== 0) return null;
    }
    if (rowIndex === y) return [...row.subarray(x * 4, x * 4 + 4)];
    previous = row;
  }
  return null;
}
for (const [name, [expectedWidth, expectedHeight]] of uiAssetSpecs) {
  const file = path.join(root, "site", "assets", "ui", name);
  if (!fs.existsSync(file)) {
    errors.push("Missing UI artwork asset: " + name);
    continue;
  }
  const bytes = fs.readFileSync(file);
  if (bytes.length < 26 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    errors.push("UI artwork must be a valid PNG: " + name);
    continue;
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    errors.push(name + ": expected " + expectedWidth + "x" + expectedHeight + ", found " + width + "x" + height);
  }
  if (bytes[25] !== 6) errors.push(name + ": UI artwork must retain its RGBA alpha channel.");
}
const dialogueSourceBytes = fs.readFileSync(path.join(root, "site", "assets", "ui", "dialogue-frame.png"));
const dialogueCutoutBytes = fs.readFileSync(path.join(root, "site", "assets", "ui", "dialogue-frame-cutout.png"));
if (readRgbaPixel(dialogueSourceBytes, 559, 142)?.[3] !== 255 ||
    readRgbaPixel(dialogueCutoutBytes, 559, 142)?.[3] !== 0 ||
    readRgbaPixel(dialogueCutoutBytes, 10, 142)?.[3] === 0) {
  errors.push("Transparent dialogue derivative must clear the center while preserving the original source and visible frame edge.");
}
for (const name of ["dialogue-frame-cutout.png", "choice-prompt.png", "choice-row-default.png", "choice-row-selected.png"]) {
  if (!stylesheet.includes(`assets/ui/${name}`)) errors.push("UI stylesheet does not use " + name);
}
const speakerNameplateRule = stylesheet.match(/\/\* Center the speaker label inside the upper-left slot in dialogue-frame(?:-cutout)?\.png\. \*\/\s*\.story \.hina strong\s*\{([^}]*)\}/i)?.[1] || "";
if (!/position:\s*absolute/i.test(speakerNameplateRule) ||
    !/left:\s*7\.8%/i.test(speakerNameplateRule) ||
    !/width:\s*31\.5%/i.test(speakerNameplateRule) ||
    !/justify-content:\s*center/i.test(speakerNameplateRule) ||
    !/text-align:\s*center/i.test(speakerNameplateRule)) {
  errors.push("Speaker nameplate must remain centered in the dialogue frame's upper-left label slot.");
}
const dialogueArtworkStyles = stylesheet.split("/* User-provided UI 2.0 panel artwork, split into responsive decorative layers. */").at(-1) || "";
const dialoguePanelRule = dialogueArtworkStyles.match(/\.dialogue-panel\s*\{([^}]*)\}/)?.[1] || "";
const dialogueVignetteRule = [...stylesheet.matchAll(/\.game-stage:not\(\[data-phase="choice"\]\) \.scene-vignette\s*\{([^}]*)\}/g)].at(-1)?.[1] || "";
const dialogueBackgroundRule = [...stylesheet.matchAll(/\.game-stage:not\(\[data-phase="choice"\]\) \.scene-art\.has-background::before\s*\{([^}]*)\}/g)].at(-1)?.[1] || "";
const dialogueSceneRule = [...stylesheet.matchAll(/\.game-stage:not\(\[data-phase="choice"\]\) \.scene-art::before\s*\{([^}]*)\}/g)].at(-1)?.[1] || "";
const choiceMarkerRule = dialogueArtworkStyles.match(/\.game-stage\[data-phase="choice"\] \.choice-marker\s*\{([^}]*)\}/)?.[1] || "";
const choiceRowRule = dialogueArtworkStyles.match(/\.game-stage\[data-phase="choice"\] \.choice\s*\{([^}]*)\}/)?.[1] || "";
const selectedChoiceRowRule = dialogueArtworkStyles.match(/\.game-stage\[data-phase="choice"\] \.choice:hover,\s*\.game-stage\[data-phase="choice"\] \.choice:focus-visible,\s*\.game-stage\[data-phase="choice"\] \.choice\.is-selected\s*\{([^}]*)\}/)?.[1] || "";
const landscapeChoiceMarkerRule = dialogueArtworkStyles.match(/@media\s*\(max-height:\s*560px\)\s*and\s*\(orientation:\s*landscape\)\s*\{[\s\S]*?\.game-stage\[data-phase="choice"\] \.choice-marker\s*\{([^}]*)\}/)?.[1] || "";
const dialogueSafeAreaRules = stylesheet.split("/* Keep normal dialogue text in the open column beside the portrait. */").at(-1) || "";
const dialogueFontSizeRules = [...stylesheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selector, declarations]) => selector.split(",").some(part => /\.story\s+p\b/.test(part)) && /\bfont-size\s*:/.test(declarations));
if (dialogueFontSizeRules.length < 5 || dialogueFontSizeRules.some(([, , declarations]) => !/font-size\s*:\s*var\(--dialogue-font-size\)/i.test(declarations))) {
  errors.push("Responsive dialogue text must preserve the player's selected font size on desktop, portrait, and landscape viewports.");
}
const mobileSafeTextRule = dialogueSafeAreaRules.match(/@media\s*\(max-width:\s*720px\)\s*\{\s*\.game-stage:not\(\[data-phase="choice"\]\) \.story > p\s*\{([^}]*)\}/)?.[1] || "";
const mobileSafeSpriteRule = dialogueSafeAreaRules.match(/@media\s*\(max-width:\s*720px\)\s*\{[\s\S]*?\.game-stage:not\(\[data-phase="choice"\]\) \.hina-sprite\s*\{([^}]*)\}/)?.[1] || "";
if (!/max-width:\s*35%/i.test(mobileSafeTextRule) ||
    !/right:\s*-12%/i.test(mobileSafeSpriteRule) ||
    !/margin-inline:\s*0\s+auto/i.test(mobileSafeTextRule)) {
  errors.push("Narrow portrait dialogue must reserve a left text column and shift the sprite right to prevent character overlap.");
}
if (!/position:\s*absolute/i.test(dialoguePanelRule) ||
    !/inset:\s*auto\s+0\s+0/i.test(dialoguePanelRule) ||
    !/padding-inline:\s*0/i.test(dialoguePanelRule) ||
    !/background-color:\s*transparent/i.test(dialoguePanelRule) ||
    !/background-image:\s*url\(["']?assets\/ui\/dialogue-frame-cutout\.png/i.test(dialoguePanelRule) ||
    !/backdrop-filter:\s*none/i.test(dialoguePanelRule)) {
  errors.push("Dialogue frame must stay anchored at the stage bottom, own the nameplate anchor, and use the transparent cutout artwork without added fill.");
}
if (!/linear-gradient\(0deg,\s*#08071038\s+0%,\s*transparent\s+42%\)/i.test(dialogueVignetteRule) ||
    !/linear-gradient\(0deg,\s*#08071016\s*,\s*#08071008\s+62%\)/i.test(dialogueBackgroundRule) ||
    !/brightness\(\.9\)/i.test(dialogueSceneRule) ||
    !/text-shadow:\s*0\s+1px\s+4px\s+#080710c9/i.test(dialogueArtworkStyles.match(/\.story p\s*\{([^}]*)\}/)?.[1] || "")) {
  errors.push("Transparent dialogue artwork must reveal the scene through a restrained bottom vignette while retaining dialogue text contrast.");
}
if (!/border:\s*0/i.test(choiceMarkerRule) ||
    !/border-radius:\s*0/i.test(choiceMarkerRule) ||
    !/background:\s*transparent/i.test(choiceMarkerRule) ||
    !/font-size:\s*clamp\(1rem/i.test(choiceMarkerRule) ||
    !/font-size:\s*clamp\(\.9rem/i.test(landscapeChoiceMarkerRule) ||
    !/background:\s*url\(["']?assets\/ui\/choice-row-default\.png/i.test(choiceRowRule) ||
    !/background-image:\s*url\(["']?assets\/ui\/choice-row-selected\.png/i.test(selectedChoiceRowRule)) {
  errors.push("Choice summaries must remain plain two- or three-character labels without a circle, remain prominent on short landscapes, and retain the surrounding dark option artwork.");
}
if (/\.story \.hina\s*\{[^}]*position:\s*relative/i.test(dialogueArtworkStyles)) {
  errors.push("Hina dialogue paragraphs must not override the dialogue frame as the nameplate positioning container.");
}
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
const historyToggleBody = source.match(/function toggleHistory\(forceOpen\)\s*\{([\s\S]*?)\n\}/)?.[1] || "";
if (!historyToggleBody.includes('document.getElementById("utilityMenuTrigger")?.focus()')) {
  errors.push("Closing the dialogue history panel must return focus to the visible utility menu trigger.");
}
const chooseBody = source.match(/function choose\(choice\)\s*\{([\s\S]*?)\n\}/)?.[1] || "";
if (!chooseBody.includes('document.getElementById("gameStage").focus({ preventScroll: true })')) {
  errors.push("Choosing a branch must return keyboard focus to the game stage after the choice buttons are removed.");
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
  const toolbarMarkup = html.match(/<nav\b(?=[^>]*\bclass="asset-toolbar")[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || "";
  const toolbarActions = [...toolbarMarkup.matchAll(/data-ui-action="([^"]+)"/g)].map(match => match[1]);
  if (JSON.stringify(toolbarActions) !== JSON.stringify(expectedToolbarActions)) {
    errors.push(page + ": quick-control toolbar must expose actions in order: " + expectedToolbarActions.join(", "));
  }
  if (!toolbarMarkup || [...toolbarMarkup.matchAll(/<button\b[^>]*>/gi)].some(match => !/\baria-label="[^"]+"/i.test(match[0]))) {
    errors.push(page + ": every toolbar button must have an accessible name.");
  }
  const menuAccessibleNames = {
    chapterMenu: "選擇章節",
    returnMain: "返回主線",
    logToggle: "對話紀錄與設定",
    saveManual: "存檔",
    loadManual: "讀檔",
    restart: "從序章重來",
    fullscreenToggle: "切換全螢幕"
  };
  for (const [id, expectedName] of Object.entries(menuAccessibleNames)) {
    const button = html.match(new RegExp(`<button\\b(?=[^>]*\\bid="${id}")[^>]*>`, "i"))?.[0] || "";
    if (!button || !button.includes(`aria-label="${expectedName}"`)) {
      errors.push(page + ": " + id + " must expose the accessible name \"" + expectedName + "\".");
    }
  }
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
  if (!html.includes("點擊／Enter／空白鍵 繼續")) {
    errors.push(page + ": dialogue hint must disclose supported keyboard advance keys");
  }
}
if (!source.includes('event.key === "Enter"') || !source.includes('event.key === " "')) {
  errors.push("Dialogue hint keyboard keys must match the runtime advance handler.");
}

if (errors.length) {
  console.error("Game shell validation failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Game shells, UI artwork and runtime backgrounds OK: " + requiredIds.length + " JavaScript-required IDs and six accessible toolbar actions exist in both pages; focus outline contrast is " + choiceFocusContrast.toFixed(2) + ":1; transparent panel assets and sprite source are present.");
}
