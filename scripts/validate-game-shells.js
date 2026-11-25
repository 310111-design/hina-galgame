#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

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
  ["dialogue-frame.png", [1118, 285]]
]);
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
for (const name of ["dialogue-frame.png", "choice-prompt.png", "choice-row-default.png", "choice-row-selected.png"]) {
  if (!stylesheet.includes(`assets/ui/${name}`)) errors.push("UI stylesheet does not use " + name);
}
const speakerNameplateRule = stylesheet.match(/\/\* Center the speaker label inside the upper-left slot in dialogue-frame\.png\. \*\/\s*\.story \.hina strong\s*\{([^}]*)\}/i)?.[1] || "";
if (!/position:\s*absolute/i.test(speakerNameplateRule) ||
    !/left:\s*7\.8%/i.test(speakerNameplateRule) ||
    !/width:\s*31\.5%/i.test(speakerNameplateRule) ||
    !/justify-content:\s*center/i.test(speakerNameplateRule) ||
    !/text-align:\s*center/i.test(speakerNameplateRule)) {
  errors.push("Speaker nameplate must remain centered in the dialogue frame's upper-left label slot.");
}
const dialogueArtworkStyles = stylesheet.split("/* User-provided UI 2.0 panel artwork, split into responsive decorative layers. */").at(-1) || "";
const dialoguePanelRule = dialogueArtworkStyles.match(/\.dialogue-panel\s*\{([^}]*)\}/)?.[1] || "";
if (!/position:\s*relative/i.test(dialoguePanelRule) ||
    !/padding-inline:\s*0/i.test(dialoguePanelRule) ||
    !/background-color:\s*transparent/i.test(dialoguePanelRule) ||
    !/background-image:\s*url\(["']?assets\/ui\/dialogue-frame\.png/i.test(dialoguePanelRule) ||
    !/backdrop-filter:\s*none/i.test(dialoguePanelRule)) {
  errors.push("Dialogue frame must own the nameplate anchor and show only the supplied artwork over the scene.");
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
