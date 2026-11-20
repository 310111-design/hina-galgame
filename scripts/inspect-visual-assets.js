"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..", "site", "assets");
const errors = [];

function pngInfo(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(signature)) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  let hasTransparency = colorType === 4 || colorType === 6;
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "tRNS") hasTransparency = true;
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return { format: "PNG", width, height, bitDepth, colorType, hasTransparency };
}

function jpegInfo(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  const sof = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
  let offset = 2;
  while (offset + 4 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (sof.has(marker) && offset + 7 < buffer.length) {
      return { format: "JPEG", height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    if (length < 2) break;
    offset += length;
  }
  return null;
}

function inspect(directory, extensions, parser) {
  const groups = new Map();
  if (!fs.existsSync(directory)) { errors.push("Missing directory: " + directory); return []; }
  for (const name of fs.readdirSync(directory).filter(file => extensions.includes(path.extname(file).toLowerCase())).sort()) {
    const filePath = path.join(directory, name);
    const buffer = fs.readFileSync(filePath);
    const info = parser(buffer);
    if (!info) { errors.push("Invalid image: " + path.relative(root, filePath)); continue; }
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    if (!groups.has(hash)) groups.set(hash, { ...info, bytes: buffer.length, sha256: hash, paths: [] });
    groups.get(hash).paths.push(path.relative(root, filePath).split(path.sep).join("/"));
  }
  return [...groups.values()];
}

const characters = inspect(path.join(root, "characters"), [".png"], pngInfo);
const backgrounds = inspect(path.join(root, "backgrounds"), [".jpg", ".jpeg"], jpegInfo);
if (!characters.length) errors.push("No character PNG assets found.");
if (!backgrounds.length) errors.push("No JPEG background assets found.");
console.log("Character PNG metadata (identical files grouped by SHA-256):");
console.log(JSON.stringify(characters, null, 2));
console.log("Background JPEG metadata (identical files grouped by SHA-256):");
console.log(JSON.stringify(backgrounds, null, 2));
if (errors.length) {
  console.error("Visual asset metadata inspection failed:");
  errors.forEach(error => console.error("- " + error));
  process.exitCode = 1;
} else {
  console.log("Visual asset metadata OK: " + characters.length + " unique character PNGs, " + backgrounds.length + " unique background JPEGs.");
}
