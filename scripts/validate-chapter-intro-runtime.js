"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const runtime = fs.readFileSync(path.join(root, "site", "chapter-intro.js"), "utf8");

for (const page of ["game.html", "testplay.html"]) {
  const markup = fs.readFileSync(path.join(root, "site", page), "utf8");
  assert.match(markup, /id="chapterIntro"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="chapterIntroTitle"[^>]*aria-describedby="chapterIntroCopy"/,
    page + " chapter intro dialog must have an accessible name and description");
  assert.match(markup, /<p id="chapterIntroCopy" class="chapter-intro-copy">/,
    page + " chapter intro description target must exist exactly in the expected element");
  assert.match(markup, /src="chapter-intro\.js\?v=chapter-a11y-20261124"/,
    page + " must cache-bust the revised chapter intro runtime");
}

function boot({ pathname = "/game.html", save = null } = {}) {
  const elements = new Map();
  const documentListeners = new Map();
  const timeouts = [];
  const storageReads = [];
  let observerCallback;
  let advances = 0;

  class Element {
    constructor(id, textContent = "") {
      this.id = id;
      this.textContent = textContent;
      this.hidden = false;
      this.isConnected = true;
      this.dataset = {};
      this.handlers = new Map();
      this.focusCalls = [];
      this.classes = new Set();
      this.classList = {
        add: name => this.classes.add(name),
        remove: name => this.classes.delete(name)
      };
    }
    addEventListener(type, callback) {
      if (!this.handlers.has(type)) this.handlers.set(type, []);
      this.handlers.get(type).push(callback);
    }
    focus(options) {
      this.focusCalls.push(options);
      document.activeElement = this;
    }
    closest() { return this.hidden ? this : null; }
    getClientRects() { return this.hidden ? [] : [this]; }
    contains(target) {
      return target === this || target === elements.get("chapterIntroStart");
    }
  }

  const ids = ["gameStage", "sceneArt", "chapterIntro", "chapterIntroStart", "chapterIntroTitle", "chapterIntroCode", "chapterLabel", "chapterToast"];
  for (const id of ids) elements.set(id, new Element(id));
  const body = new Element("body");
  const documentElement = new Element("html");
  const document = {
    body,
    documentElement,
    activeElement: body,
    getElementById: id => elements.get(id) || null,
    addEventListener(type, callback) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(callback);
    }
  };
  const scene = elements.get("sceneArt");
  scene.dataset.chapter = "P01";
  elements.get("chapterLabel").textContent = "P01";
  elements.get("chapterToast").textContent = "P01｜放學後的十分鐘";
  elements.get("chapterIntro").hidden = true;

  class MutationObserver {
    constructor(callback) { observerCallback = callback; }
    observe(target, options) {
      assert.equal(target, scene);
      assert.equal(options.attributes, true);
      assert.equal(options.attributeOldValue, true);
      assert.deepEqual(Array.from(options.attributeFilter), ["data-chapter"]);
    }
  }

  const sandbox = {
    document,
    location: { pathname },
    localStorage: {
      getItem(key) {
        storageReads.push(key);
        return save?.key === key ? save.value : null;
      }
    },
    MutationObserver,
    window: {
      HINA_GAME_DATA: [{ id: "P01", title: "放學後的十分鐘" }, { id: "P02", title: "走廊裡的光" }],
      advanceLine() { advances += 1; return "advanced"; },
      setTimeout(callback, delay) { timeouts.push({ callback, delay }); return timeouts.length; }
    }
  };
  vm.runInNewContext(runtime, sandbox, { filename: "chapter-intro.js" });

  function press(key, target) {
    const event = {
      key,
      target,
      prevented: false,
      stopped: false,
      preventDefault() { this.prevented = true; },
      stopImmediatePropagation() { this.stopped = true; }
    };
    for (const listener of documentListeners.get("keydown") || []) listener(event);
    return event;
  }

  function finishClose() {
    const timer = timeouts.shift();
    assert.ok(timer, "dismissal must schedule the fade-out completion");
    assert.equal(timer.delay, 300);
    timer.callback();
  }

  return {
    document, elements, scene, storageReads, timeouts, window: sandbox.window,
    get observerCallback() { return observerCallback; },
    get advances() { return advances; },
    press, finishClose
  };
}

const fresh = boot();
const overlay = fresh.elements.get("chapterIntro");
const start = fresh.elements.get("chapterIntroStart");
const stage = fresh.elements.get("gameStage");
assert.equal(overlay.hidden, false, "new players must see the opening card");
assert.equal(fresh.elements.get("chapterIntroCode").textContent, "P01");
assert.equal(fresh.elements.get("chapterIntroTitle").textContent, "放學後的十分鐘");
assert.equal(fresh.document.activeElement, start, "opening card must receive initial focus");
assert.equal(fresh.window.advanceLine(), undefined, "autoplay advances must be blocked while the card is open");
assert.equal(fresh.advances, 0);

const tab = fresh.press("Tab", start);
assert.equal(tab.prevented, true);
assert.equal(tab.stopped, true);
assert.equal(fresh.document.activeElement, start, "Tab must remain inside the single-button dialog");
for (const listener of start.handlers.get("click") || []) listener({ target: start });
assert.ok(overlay.classes.has("is-leaving"), "button activation must begin the card dismissal");
fresh.finishClose();
assert.equal(overlay.hidden, true);
assert.equal(fresh.document.activeElement, stage, "first-load dismissal must focus the game stage, not body");
assert.equal(fresh.window.advanceLine(), "advanced");
assert.equal(fresh.advances, 1);

fresh.elements.get("chapterLabel").textContent = "P02";
fresh.elements.get("chapterToast").textContent = "P02｜走廊裡的光";
fresh.scene.dataset.chapter = "P02";
fresh.observerCallback([{ oldValue: "P01" }]);
assert.equal(overlay.hidden, false, "entering another chapter must show the chapter card");
assert.equal(fresh.elements.get("chapterIntroCode").textContent, "P02");
assert.equal(fresh.elements.get("chapterIntroTitle").textContent, "走廊裡的光");
assert.equal(fresh.document.activeElement, start);
const escape = fresh.press("Escape", start);
assert.equal(escape.prevented, true);
assert.equal(escape.stopped, true);
fresh.finishClose();
assert.equal(fresh.document.activeElement, stage, "chapter-change dismissal must restore the prior focus target");
fresh.observerCallback([{ oldValue: "P02" }]);
assert.equal(overlay.hidden, true, "same-chapter DOM updates must not replay the card");

const hiddenOrigin = {
  isConnected: true,
  hidden: false,
  disabled: false,
  closest() { return this.hidden ? this : null; },
  getClientRects() { return this.hidden ? [] : [this]; }
};
fresh.document.activeElement = hiddenOrigin;
fresh.elements.get("chapterLabel").textContent = "P03";
fresh.elements.get("chapterToast").textContent = "P03｜放學後的提問";
fresh.scene.dataset.chapter = "P03";
fresh.observerCallback([{ oldValue: "P02" }]);
hiddenOrigin.hidden = true;
fresh.press("Escape", start);
fresh.finishClose();
assert.equal(fresh.document.activeElement, stage, "a prior target hidden during the transition must fall back to the stage");

const fullSave = boot({
  save: { key: "hina-galgame-full-v4", value: JSON.stringify({ chapter: 0, phase: "intro" }) }
});
assert.equal(fullSave.elements.get("chapterIntro").hidden, true, "valid saves must resume without the opening card");
assert.ok(fullSave.storageReads.includes("hina-galgame-full-v4"));

const testplaySave = boot({
  pathname: "/testplay.html",
  save: { key: "hina-galgame-testplay-v3", value: JSON.stringify({ chapter: 1, phase: "branch" }) }
});
assert.equal(testplaySave.elements.get("chapterIntro").hidden, true, "testplay saves must resume in place");
assert.ok(testplaySave.storageReads.includes("hina-galgame-testplay-v3"));

console.log("Chapter intro checks passed: accessible description, opening and chapter cards, focus containment/restoration, autoplay lock and full/testplay save resume.");

