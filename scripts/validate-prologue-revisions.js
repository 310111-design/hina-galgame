"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "site", "game-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const chapters = sandbox.window.HINA_GAME_DATA;

function getChapter(id) {
  const matches = chapters.filter(chapter => chapter.id === id);
  assert.equal(matches.length, 1, `${id}: expected exactly one runtime chapter`);
  return matches[0];
}

function exactCount(text, value) {
  return text.split(value).length - 1;
}

function assertSynced(id, section, value, label) {
  const chapter = getChapter(id);
  const tuples = chapter[section];
  assert.ok(Array.isArray(tuples), `${id}.${section}: expected dialogue array`);
  assert.equal(tuples.filter(tuple => tuple[1] === value).length, 1, `${label}: runtime tuple mismatch`);

  const markdown = fs.readFileSync(path.join(root, "story", "chapters", `${id}.md`), "utf8");
  assert.equal(exactCount(markdown, value), 1, `${label}: manuscript text should appear exactly once`);
}

const revisions = [
  ["P01", "common", "夕陽完全沉下去後，杯壁中未散的熱氣也慢慢消失。放學的人聲逐漸遠去，周圍跟著安靜下來。", "PRT-01 location-neutral close"],
  ["P01", "common", "尚未處理完的公務，仍要等明天再繼續。", "PRT-01 unresolved work"],
  ["P01", "common", "明天會有新的文件從委員會各處送來，也可能有人為了今天的決定再跑來確認。陽奈的責任感不會因為一次休息、一場協助或暫時離開工作就消失。", "PRT-01 responsibility"],
  ["P01", "common", "你看著陽奈安靜下來。未完成的公務仍要等明天；剛才那段時間不需要被重新算進工作。她沒有再催促自己把所有事情立刻完成。", "PRT-01 common state"],
  ["P01", "common", "但陽奈想到明天還有工作時，已不再像是在接受一項考核。", "PRT-01 closing action"],
  ["P02", "branches", "「今天我想試著不一直確認時間，先把這十分鐘留給自己。」", "PRT-02 present intention"],
  ["P02", "branches", "這裡也可以留出一段休息的時間。", "PRT-02 remove required past event"],
  ["P02", "branches", "「今天沒有需要由我親自決定的急件。我們可以先把需要我確認和能一起處理的項目分清楚。」", "PRT-03 present collaboration"],
  ["P02", "branches", "「任何標記都不是最後決定。如果不確定，就先記在便箋下方，等我們確認後再歸類。」", "PRT-04 two-column list"],
  ["P02", "branches", "點心吃完後，陽奈拿起杯子，沿走廊回到風紀委員會辦公室，將杯子放回桌邊；你們確認隨身物品都收妥，才一同離開屋頂。", "PRT-05 explicit return"],
  ["P02", "common", "陽奈確認熱飲杯已收妥，沒有讓這段時間變成另一項待辦事項。", "PRT-05 common item state"],
  ["P03", "intro", "陽奈收起桌上的文件，卻沒有立刻把工作全部塞進公文夾。", "PRT-06 opening object"],
  ["P03", "branches", "「下次我想先決定，到時要把時間留給什麼。」", "PRT-06 temporal wording"],
  ["P03", "branches", "她另取一張分工用便箋，把這句話寫在背面，提醒自己下一次遇到工作時，先確認哪些步驟能交付。", "PRT-06 separate teamwork note"],
  ["P03", "common", "陽奈另外抽出一張便條，在上面寫下「十分鐘」，再把它夾到公文夾最上面，留給明天的自己。", "PRT-06 explicit note creation"]
];

for (const [id, section, value, label] of revisions) {
  if (section === "branches") {
    const chapter = getChapter(id);
    const branches = Object.values(chapter.branches).flat();
    assert.equal(branches.filter(tuple => tuple[1] === value).length, 1, `${label}: runtime branch tuple mismatch`);
    const markdown = fs.readFileSync(path.join(root, "story", "chapters", `${id}.md`), "utf8");
    assert.equal(exactCount(markdown, value), 1, `${label}: manuscript text should appear exactly once`);
  } else {
    assertSynced(id, section, value, label);
  }
}

const p01 = fs.readFileSync(path.join(root, "story", "chapters", "P01.md"), "utf8");
assert.ok(p01.includes("【下一章：P02「每條路的十分鐘」】"), "PRT-07: P01 next-chapter navigation is missing");
assert.ok(!p01.includes("【選項：P02】"), "PRT-07: stale pseudo-choice navigation remains");

const p02 = getChapter("P02");
const p02Markdown = fs.readFileSync(path.join(root, "story", "chapters", "P02.md"), "utf8").split("## P02-A")[0];
const manuscriptChoices = [...p02Markdown.matchAll(/^([ABC])\. (.+)$/gm)].map(([, letter, label]) => ({ letter, label }));
assert.equal(JSON.stringify(manuscriptChoices), JSON.stringify(p02.choices.map(({ letter, label }) => ({ letter, label }))), "PRT-03/07: P02 manuscript choice labels differ from runtime");

const stale = [
  ["P02", "昨天的時候，我一直在確認時間是不是到了。今天想試著不確認。"],
  ["P02", "今天沒有需要由我親自決定的急件。可以試試昨天的方式。"],
  ["P02", "任何標記都不是最後決定。如果不確定，就寫在中間那一欄。"],
  ["P02", "陽奈把熱飲杯收進桌邊，或放回紙袋，或帶回辦公室的隔夜位置。"],
  ["P03", "那張便條會被帶回明天的辦公桌。"]
];
for (const [id, oldText] of stale) {
  const chapter = getChapter(id);
  const markdown = fs.readFileSync(path.join(root, "story", "chapters", `${id}.md`), "utf8");
  const runtimeText = JSON.stringify(chapter);
  assert.equal(exactCount(markdown, oldText), 0, `${id}: stale manuscript wording remains`);
  assert.equal(exactCount(runtimeText, oldText), 0, `${id}: stale runtime wording remains`);
}

console.log(`Prologue revision sync OK: ${revisions.length} exact manuscript/runtime pairs, P02 choices, P01 navigation, and stale-phrase guards.`);
