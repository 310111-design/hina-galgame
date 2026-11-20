const isTestplay = location.pathname.includes("testplay");
const STORAGE_KEY = isTestplay ? "hina-galgame-testplay-v3" : "hina-galgame-full-v4";
const LEGACY_STORAGE_KEY = isTestplay ? "hina-galgame-testplay-v2" : "hina-galgame-act1-v3";
const MANUAL_SAVE_KEY = isTestplay ? "hina-galgame-testplay-manual-v1" : "hina-galgame-manual-v1";
const chapters = window.HINA_GAME_DATA || [];
const SPRITE_FALLBACK = "assets/hina-sprite.svg";
const EMOTION_SPRITES = {
  "意外": "assets/hina/emotion-surprised.png",
  "克制": "assets/hina/emotion-composed.png",
  "微羞": "assets/hina/emotion-shy.png",
  "嚴謹": "assets/hina/emotion-serious.png",
  "不安": "assets/hina/emotion-uneasy.png",
  "認真": "assets/hina/emotion-serious.png",
  "疲倦": "assets/hina/emotion-tired.png",
  "沉思": "assets/hina/emotion-thinking.png",
  "微笑": "assets/hina/emotion-smile.png",
  "安心": "assets/hina/emotion-relieved.png",
  "警戒": "assets/hina/emotion-alert.png"
};

const defaultState = () => ({
  version: 2,
  chapter: 0,
  phase: "intro",
  line: 0,
  choices: {},
  flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0, self_rest: 0 }
});

let state = loadState();
let audioContext = null;
let ambientNodes = [];
let musicEnabled = true;
let typingTimer = null;
let typingLine = null;
let dialogueHistory = [];
let lastHistoryKey = "";
const READING_SETTINGS_KEY = isTestplay ? "hina-reading-settings-testplay-v1" : "hina-reading-settings-v1";
let readingSettings = loadReadingSettings();
let autoAdvanceTimer = null;

function loadReadingSettings() {
  const defaults = { speed: 26, autoPlay: false };
  try {
    const saved = JSON.parse(localStorage.getItem(READING_SETTINGS_KEY) || "null");
    const allowedSpeeds = [44, 26, 12];
    return {
      speed: allowedSpeeds.includes(saved?.speed) ? saved.speed : defaults.speed,
      autoPlay: saved?.autoPlay === true
    };
  } catch (_) {
    return defaults;
  }
}

function saveReadingSettings() {
  try {
    localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(readingSettings));
  } catch (_) {}
}

function clearAutoAdvance() {
  if (autoAdvanceTimer !== null) window.clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = null;
}

function scheduleAutoAdvance() {
  clearAutoAdvance();
  if (!readingSettings.autoPlay || state.phase === "choice" || state.phase === "complete") return;
  if (document.getElementById("logPanel").classList.contains("is-open")) return;
  autoAdvanceTimer = window.setTimeout(() => {
    autoAdvanceTimer = null;
    advanceLine();
  }, 1100);
}

function startTypewriterTimer() {
  if (typingTimer) window.clearInterval(typingTimer);
  if (!typingLine) return;
  typingTimer = window.setInterval(() => {
    if (!typingLine) {
      window.clearInterval(typingTimer);
      typingTimer = null;
      return;
    }
    typingLine.index += 1;
    typingLine.node.textContent = typingLine.characters.slice(0, typingLine.index).join("");
    if (typingLine.index >= typingLine.characters.length) {
      window.clearInterval(typingTimer);
      typingTimer = null;
      typingLine = null;
      document.getElementById("dialogueHint").textContent = "點擊畫面任意空白處繼續　›";
      scheduleAutoAdvance();
    }
  }, readingSettings.speed);
}

function updateReadingControls() {
  const speed = document.getElementById("typingSpeed");
  const auto = document.getElementById("autoPlayToggle");
  if (speed) speed.value = String(readingSettings.speed);
  if (auto) auto.checked = readingSettings.autoPlay;
}

function loadState() {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    const legacyRaw = currentRaw ? null : localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = JSON.parse(currentRaw || legacyRaw || "null");
    const legacyOffset = currentRaw && saved?.version === 2 ? 0 : 3;
    const chapterIndex = Number.isInteger(saved?.chapter) ? saved.chapter + legacyOffset : -1;

    if (saved && chapterIndex >= 0 && chapterIndex < chapters.length) {
      const restored = {
        ...defaultState(),
        ...saved,
        version: 2,
        chapter: chapterIndex,
        flags: { ...defaultState().flags, ...(saved.flags || {}) }
      };
      const validPhases = ["intro", "choice", "branch", "common", "complete"];
      if (!validPhases.includes(restored.phase)) return defaultState();
      if (!Number.isInteger(restored.line) || restored.line < 0) restored.line = 0;

      // Legacy saves gain the three newly playable prologue chapters at the front.
      if (restored.phase === "complete" && restored.chapter < chapters.length - 1) {
        restored.chapter += 1;
        restored.phase = "intro";
        restored.line = 0;
      }
      return restored;
    }
  } catch (_) {}
  return defaultState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.getElementById("saveState").textContent = "已自動保存";
}

function getSequence() {
  const chapter = chapters[state.chapter];
  if (!chapter) return [];
  let sequence = [];
  if (state.phase === "intro") sequence = chapter.intro;
  if (state.phase === "branch") {
    const selected = state.choices[chapter.id]?.letter;
    sequence = selected ? chapter.branches[selected] || [] : [];
  }
  if (state.phase === "common") sequence = chapter.common;
  if (state.phase === "intro" && Array.isArray(chapter.flaggedIntro)) {
    const conditionalLines = chapter.flaggedIntro
      .filter(item => (state.flags[item.flag] || 0) >= (item.min || 1))
      .flatMap(item => item.lines || []);
    sequence = [...sequence, ...conditionalLines];
  }
  sequence = sequence.filter(line => Array.isArray(line) && String(line[1] || "").trim());
  return sequence;
}

function revealCurrentLine() {
  if (!typingTimer || !typingLine) return false;
  window.clearInterval(typingTimer);
  typingTimer = null;
  typingLine.node.textContent = typingLine.fullText;
  typingLine = null;
  document.getElementById("dialogueHint").textContent = "點擊畫面任意空白處繼續　›";
  scheduleAutoAdvance();
  return true;
}

function advanceLine() {
  clearAutoAdvance();
  if (revealCurrentLine()) return;
  const chapter = chapters[state.chapter];
  if (!chapter) return;
  if (state.phase === "complete") return;
  startAmbient();

  const sequence = getSequence();
  if (state.line < sequence.length - 1) {
    state.line += 1;
  } else if (state.phase === "intro") {
    state.line = 0;
    state.phase = "choice";
  } else if (state.phase === "branch") {
    state.line = 0;
    state.phase = "common";
  } else if (state.phase === "common") {
    state.line = 0;
    if (state.chapter === chapters.length - 1) state.phase = "complete";
    else {
      state.chapter += 1;
      state.phase = "intro";
    }
  }
  render();
}

function currentLine() {
  const sequence = getSequence();
  return sequence[Math.min(state.line, Math.max(sequence.length - 1, 0))] || ["narration", ""];
}

function setMood(text) {
  document.getElementById("mood").textContent = text;
}

function animateSprite(kind, text) {
  const sprite = document.getElementById("hinaSprite");
  sprite.className = "hina-sprite";
  const lower = text;
  if (lower.includes("疲")) sprite.classList.add("tired");
  if (lower.includes("微笑") || lower.includes("放鬆")) sprite.classList.add("smile");
  if (lower.includes("沉思") || lower.includes("思考")) sprite.classList.add("thinking");
  if (kind === "hina") {
    void sprite.offsetWidth;
    sprite.classList.add("animate");
  }
}

function setSpriteEmotion(mood) {
  const sprite = document.getElementById("hinaSprite");
  const source = EMOTION_SPRITES[mood];
  if (!source || sprite.dataset.emotion === mood) return;
  sprite.dataset.emotion = mood;
  sprite.onerror = () => {
    sprite.onerror = null;
    sprite.src = SPRITE_FALLBACK;
  };
  sprite.src = source;
}

const SCENE_BY_CHAPTER = {
  P01: "office", P02: "office", P03: "office",
  A01: "office", A02: "office", A03: "office", A04: "corridor", A05: "office", A06: "office",
  B01: "office", B02: "office", B03: "office", B04: "office", B05: "office", B06: "office", B07: "office", B08: "office",
  C01: "office", C02: "office", C03: "rooftop", C04: "office", C05: "office", C06: "rooftop",
  D01: "cafe", D02: "cafe", D03: "home", D04: "outdoor", D05: "cafe", D06: "home", D07: "cafe"
};

function updateScene() {
  const chapter = chapters[state.chapter];
  const scene = document.getElementById("sceneArt");
  const selected = chapter ? state.choices[chapter.id]?.letter : null;
  const roofScene = ["P01", "P02"].includes(chapter?.id) && state.phase === "branch" && selected === "C";
  const sceneType = roofScene ? "rooftop" : (SCENE_BY_CHAPTER[chapter?.id] || "office");
  scene.className = "scene-art " + sceneType;
  scene.dataset.chapter = chapter?.id || "";
  setMood(chapter?.mood || "認真");

  if (state.phase === "choice") setMood("等待選擇");
  if (state.phase === "complete") setMood("目前內容完成");
}

function addHistoryEntry(kind, text) {
  const chapter = chapters[state.chapter];
  const key = `${chapter?.id || "?"}:${state.phase}:${state.line}`;
  if (key === lastHistoryKey) return;
  lastHistoryKey = key;
  dialogueHistory.push({
    chapter: chapter?.id || "",
    speaker: kind === "hina" ? "空崎陽奈" : kind === "system" ? "系統" : "旁白",
    text
  });
  if (dialogueHistory.length > 500) dialogueHistory.shift();
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("logList");
  if (!list) return;
  list.replaceChildren();
  if (!dialogueHistory.length) {
    const empty = document.createElement("p");
    empty.className = "log-empty";
    empty.textContent = "尚無對話紀錄。";
    list.appendChild(empty);
    return;
  }
  dialogueHistory.forEach(entry => {
    const article = document.createElement("article");
    article.className = "log-entry";
    const meta = document.createElement("div");
    meta.className = "log-meta";
    meta.textContent = `${entry.chapter} · ${entry.speaker}`;
    const body = document.createElement("p");
    body.textContent = entry.text;
    article.append(meta, body);
    list.appendChild(article);
  });
  list.scrollTop = list.scrollHeight;
}

function toggleHistory(forceOpen) {
  const panel = document.getElementById("logPanel");
  const open = typeof forceOpen === "boolean" ? forceOpen : !panel.classList.contains("is-open");
  panel.classList.toggle("is-open", open);
  panel.setAttribute("aria-hidden", String(!open));
  panel.inert = !open;
  document.getElementById("logToggle").setAttribute("aria-expanded", String(open));
  if (open) clearAutoAdvance();
  else if (!typingLine) scheduleAutoAdvance();
  if (open) renderHistory();
}

function renderDialogue([kind, text, mood]) {
  if (typingTimer) window.clearInterval(typingTimer);
  typingTimer = null;
  typingLine = null;
  clearAutoAdvance();
  const story = document.getElementById("story");
  story.replaceChildren();
  const p = document.createElement("p");
  const textNode = document.createTextNode("");

  if (kind === "hina") {
    p.className = "hina";
    const strong = document.createElement("strong");
    strong.textContent = "空崎陽奈";
    p.append(strong, textNode);
  } else if (kind === "system") {
    p.className = "system";
    p.appendChild(textNode);
  } else {
    p.className = "narration";
    p.appendChild(textNode);
  }
  story.appendChild(p);
  if (kind === "hina") setSpriteEmotion(mood);
  animateSprite(kind, text);
  addHistoryEntry(kind, text);

  const characters = Array.from(text);
  if (!characters.length) {
    document.getElementById("dialogueHint").textContent = "點擊畫面任意空白處繼續　›";
    return;
  }
  typingLine = { characters, fullText: text, node: textNode, index: 0 };
  document.getElementById("dialogueHint").textContent = "點擊可立即顯示完整句";
  startTypewriterTimer();
}

function renderFlags() {
  const box = document.getElementById("flags");
  box.innerHTML = "";
  Object.entries(state.flags).forEach(([name, value]) => {
    if (value > 0) {
      const span = document.createElement("span");
      span.className = "flag";
      span.textContent = `${name.replace("ordinary_day", "ordinary")} ${value}`;
      box.appendChild(span);
    }
  });
}

function render() {
  clearAutoAdvance();
  const chapter = chapters[state.chapter];
  if (!chapter) return;

  document.getElementById("chapterLabel").textContent = `${chapter.id}｜${chapter.title}`;
  document.getElementById("progress").style.width = `${((state.chapter + 1) / chapters.length) * 100}%`;
  renderFlags();
  updateScene();

  const box = document.getElementById("choices");
  box.innerHTML = "";

  if (state.phase === "choice") {
    document.getElementById("story").innerHTML =
      '<p class="narration">陽奈等著你回答。這個選擇會保留在之後的章節中。</p>';
    chapter.choices.forEach(choice => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.innerHTML = `${choice.label}<small>影響：${choice.hint}</small>`;
      button.addEventListener("click", () => choose(choice));
      box.appendChild(button);
    });
  } else if (state.phase === "complete") {
    document.getElementById("story").innerHTML =
      '<p class="hina"><strong>目前可玩內容完成</strong></p>' +
      '<p class="narration">已完成序章 P01～P03 與 A01～D07 共 30 節內容。你的選擇與旗標會保存在這個瀏覽器中。</p>' +
      `<p class="system">rest ${state.flags.rest}｜teamwork ${state.flags.teamwork}｜ordinary_day ${state.flags.ordinary_day}｜daily_checkin ${state.flags.daily_checkin}｜self_rest ${state.flags.self_rest}</p>`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next";
    button.textContent = "重新開始完整體驗版";
    button.addEventListener("click", restart);
    box.appendChild(button);
  } else {
    renderDialogue(currentLine());
  }
  saveState();
}

function choose(choice) {
  const chapter = chapters[state.chapter];
  state.flags[choice.flag] = (state.flags[choice.flag] || 0) + 1;
  if (chapter.id === "A06") state.flags.daily_checkin += 1;
  state.choices[chapter.id] = choice;
  state.phase = "branch";
  state.line = 0;
  render();
  playConfirmSound();
}

function restart() {
  if (!window.confirm("要從序章重新開始嗎？目前自動存檔會更新。")) return;
  state = defaultState();
  dialogueHistory = [];
  lastHistoryKey = "";
  renderHistory();
  render();
  playConfirmSound();
}

function openChapterMenu() {
  clearAutoAdvance();
  const list = document.getElementById("chapterList");
  list.innerHTML = "";
  chapters.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chapter-item";
    const current = index === state.chapter;
    button.innerHTML = `<span class="chapter-code">${chapter.id}</span><span class="chapter-title">${chapter.title}</span><span class="chapter-status">${current ? "目前章節" : "直接進入"} ›</span>`;
    button.addEventListener("click", () => {
      state.chapter = index;
      state.phase = "intro";
      state.line = 0;
      document.getElementById("chapterDialog").close();
      render();
    });
    list.appendChild(button);
  });
  document.getElementById("chapterDialog").showModal();
}

function saveManual() {
  try {
    const payload = { ...state, savedAt: new Date().toISOString() };
    localStorage.setItem(MANUAL_SAVE_KEY, JSON.stringify(payload));
    document.getElementById("saveState").textContent = "手動存檔完成";
  } catch (_) {
    document.getElementById("saveState").textContent = "存檔失敗：儲存空間不可用";
  }
}

function loadManual() {
  try {
    const raw = localStorage.getItem(MANUAL_SAVE_KEY);
    if (!raw) {
      document.getElementById("saveState").textContent = "尚無手動存檔";
      return;
    }
    const saved = JSON.parse(raw);
    if (!Number.isInteger(saved.chapter) || saved.chapter < 0 || saved.chapter >= chapters.length ||
        !["intro", "choice", "branch", "common", "complete"].includes(saved.phase) ||
        !Number.isInteger(saved.line) || saved.line < 0) {
      document.getElementById("saveState").textContent = "手動存檔格式無效";
      return;
    }
    state = {
      ...defaultState(),
      ...saved,
      version: 2,
      flags: { ...defaultState().flags, ...(saved.flags || {}) }
    };
    render();
    document.getElementById("saveState").textContent = "已讀取手動存檔";
  } catch (_) {
    document.getElementById("saveState").textContent = "讀取失敗：存檔資料無效";
  }
}

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
}

function startAmbient() {
  if (!musicEnabled || ambientNodes.length) return;
  ensureAudio();
  const master = audioContext.createGain();
  master.gain.value = 0.018;
  master.connect(audioContext.destination);
  [220, 277.18, 329.63].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.9 : 0.35;
    oscillator.connect(gain).connect(master);
    oscillator.start();
    ambientNodes.push(oscillator);
  });
  ambientNodes.push(master);
}

function stopAmbient() {
  ambientNodes.forEach(node => {
    if (typeof node.stop === "function") node.stop();
    if (typeof node.disconnect === "function") node.disconnect();
  });
  ambientNodes = [];
}

function playConfirmSound() {
  if (!musicEnabled) return;
  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.18);
}

document.getElementById("gameStage").addEventListener("click", event => {
  if (event.target.closest("button, a, input, select, textarea")) return;
  if (document.getElementById("logPanel").classList.contains("is-open")) return;
  if (state.phase === "choice" || state.phase === "complete") return;
  advanceLine();
});

document.getElementById("fullscreenToggle").addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch (_) {
    document.getElementById("saveState").textContent = "此瀏覽器不支援全螢幕切換";
  }
});

document.getElementById("chapterMenu").addEventListener("click", openChapterMenu);
document.getElementById("logToggle").addEventListener("click", () => toggleHistory());
document.getElementById("logClose").addEventListener("click", () => toggleHistory(false));
document.getElementById("typingSpeed").addEventListener("change", event => {
  readingSettings.speed = Number(event.currentTarget.value);
  saveReadingSettings();
  if (typingLine) startTypewriterTimer();
});
document.getElementById("autoPlayToggle").addEventListener("change", event => {
  readingSettings.autoPlay = event.currentTarget.checked;
  saveReadingSettings();
  if (readingSettings.autoPlay && !typingLine) scheduleAutoAdvance();
  else clearAutoAdvance();
});
document.getElementById("closeChapterMenu").addEventListener("click", () => {
  document.getElementById("chapterDialog").close();
  if (!typingLine) scheduleAutoAdvance();
});
document.getElementById("restart").addEventListener("click", restart);
document.getElementById("saveManual").addEventListener("click", saveManual);
document.getElementById("loadManual").addEventListener("click", loadManual);
document.getElementById("audioToggle").addEventListener("click", event => {
  musicEnabled = !musicEnabled;
  event.currentTarget.textContent = musicEnabled ? "♫ 音樂開" : "♫ 音樂關";
  if (musicEnabled) startAmbient();
  else stopAmbient();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.getElementById("logPanel").classList.contains("is-open")) {
    toggleHistory(false);
    return;
  }
  if (event.target.closest("button, a, input, select, textarea") || document.querySelector("dialog[open]") || document.getElementById("logPanel").classList.contains("is-open")) return;
  if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
    if (state.phase !== "choice" && state.phase !== "complete") {
      event.preventDefault();
      advanceLine();
    }
  }
});

updateReadingControls();
render();
