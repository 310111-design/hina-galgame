const isTestplay = location.pathname.includes("testplay");
const STORAGE_KEY = isTestplay ? "hina-galgame-testplay-v3" : "hina-galgame-full-v4";
const LEGACY_STORAGE_KEY = isTestplay ? "hina-galgame-testplay-v2" : "hina-galgame-act1-v3";
const MANUAL_SAVE_KEY = isTestplay ? "hina-galgame-testplay-manual-v1" : "hina-galgame-manual-v1";
const MANUAL_SLOTS_KEY = isTestplay ? "hina-galgame-testplay-manual-slots-v2" : "hina-galgame-manual-slots-v2";
const MANUAL_SLOT_COUNT = 6;
const chapters = window.HINA_GAME_DATA || [];
const SPRITE_FALLBACK = "assets/hina-sprite.svg";
// Keep source PNGs unchanged; exact-pixel lossless WebP copies reduce transfer size.
// Failed WebP loads retry the matching PNG, then the shared SVG fallback.
const EMOTION_SPRITES = {
  普通: "assets/characters/hina-expression-neutral.webp",
  認真: "assets/characters/hina-expression-serious.webp",
  嚴肅: "assets/characters/hina-expression-serious.webp",
  嚴謹: "assets/characters/hina-expression-serious.webp",
  克制: "assets/characters/hina-expression-serious.webp",
  安定: "assets/characters/hina-expression-neutral.webp",
  微笑: "assets/characters/hina-expression-smile.webp",
  放鬆: "assets/characters/hina-expression-relaxed.webp",
  安心: "assets/characters/hina-expression-relaxed.webp",
  意外: "assets/characters/hina-expression-surprised.webp",
  驚訝: "assets/characters/hina-expression-surprised.webp",
  好奇: "assets/characters/hina-expression-curious.webp",
  沉思: "assets/characters/hina-expression-confused.webp",
  思考: "assets/characters/hina-expression-confused.webp",
  疑惑: "assets/characters/hina-expression-confused.webp",
  困惑: "assets/characters/hina-expression-confused.webp",
  不安: "assets/characters/hina-expression-worried.webp",
  擔憂: "assets/characters/hina-expression-worried.webp",
  疲倦: "assets/characters/hina-expression-sleepy.webp",
  疲憊: "assets/characters/hina-expression-sleepy.webp",
  困倦: "assets/characters/hina-expression-sleepy.webp",
  生氣: "assets/characters/hina-expression-angry.webp",
  不耐: "assets/characters/hina-expression-angry.webp",
  警戒: "assets/characters/hina-expression-angry.webp",
  警惕: "assets/characters/hina-expression-angry.webp",
  害羞: "assets/characters/hina-expression-shy.webp",
  微羞: "assets/characters/hina-expression-shy.webp",
  開心: "assets/characters/hina-expression-happy.webp",
  不捨: "assets/characters/hina-expression-reluctant.webp",
  難過: "assets/characters/hina-expression-reluctant.webp",
  悲傷: "assets/characters/hina-expression-reluctant.webp"
};

// The 13 source images share a canvas but have different transparent bounds.
// Normalize the visible figure height and bottom edge without editing source art.
const SPRITE_FRAME_HEIGHT = 1200;
const SPRITE_REFERENCE_HEIGHT = 1122;
const SPRITE_REFERENCE_BOTTOM = 1176;
const SPRITE_FRAME_NORMALIZATION = {
  "hina-expression-angry.webp": { contentHeight: 1112, contentBottom: 1180 },
  "hina-expression-confused.webp": { contentHeight: 1039, contentBottom: 1171 },
  "hina-expression-curious.webp": { contentHeight: 1111, contentBottom: 1176 },
  "hina-expression-happy.webp": { contentHeight: 1122, contentBottom: 1176 },
  "hina-expression-neutral.webp": { contentHeight: 1127, contentBottom: 1175 },
  "hina-expression-relaxed.webp": { contentHeight: 1068, contentBottom: 1161 },
  "hina-expression-reluctant.webp": { contentHeight: 1102, contentBottom: 1172 },
  "hina-expression-serious.webp": { contentHeight: 1081, contentBottom: 1175 },
  "hina-expression-shy.webp": { contentHeight: 1139, contentBottom: 1190 },
  "hina-expression-sleepy.webp": { contentHeight: 1131, contentBottom: 1191 },
  "hina-expression-smile.webp": { contentHeight: 1155, contentBottom: 1192 },
  "hina-expression-surprised.webp": { contentHeight: 1130, contentBottom: 1187 },
  "hina-expression-worried.webp": { contentHeight: 1135, contentBottom: 1179 }
};

const defaultState = () => ({
  version: 2,
  chapter: 0,
  phase: "intro",
  line: 0,
  choices: {},
  flags: { rest: 0, teamwork: 0, ordinary_day: 0, daily_checkin: 0, self_rest: 0 },
  route: null
});

let autoSaveWriteBlocked = false;
let autoSaveWriteBlockedMessage = "";
let state = loadState();
let audioContext = null;
let ambientNodes = [];
let ambientMaster = null;
let activeSceneType = "office";
let currentMusicScene = null;
let typingTimer = null;
let typingLine = null;
let suppressDialogueAnnouncements = false;
let dialogueHistory = [];
let lastHistoryKey = "";
const READING_SETTINGS_KEY = isTestplay ? "hina-reading-settings-testplay-v1" : "hina-reading-settings-v1";
const AUDIO_SETTINGS_KEY = isTestplay ? "hina-audio-settings-testplay-v1" : "hina-audio-settings-v1";
const READ_LINES_KEY = isTestplay ? "hina-read-lines-testplay-v1" : "hina-read-lines-v1";
let readingSettings = loadReadingSettings();
let audioSettings = loadAudioSettings();
let musicEnabled = audioSettings.enabled;
let autoAdvanceTimer = null;
let replayMode = false;
let mainStateSnapshot = null;
let saveDialogMode = "save";
let manualSaveWriteBlocked = false;
let manualSaveWriteBlockedMessage = "";
let readLineKeys = loadReadLineKeys();

function loadReadLineKeys() {
  try {
    const saved = JSON.parse(localStorage.getItem(READ_LINES_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter(item => typeof item === "string").slice(-5000) : []);
  } catch (_) {
    return new Set();
  }
}

function currentReadLineKey() {
  const chapter = chapters[state.chapter];
  const line = currentLine();
  return chapter ? `${chapter.id}:${state.phase}:${state.line}:${String(line[1] || "")}` : "";
}

function markCurrentLineRead() {
  const key = currentReadLineKey();
  if (!key || readLineKeys.has(key)) return;
  readLineKeys.add(key);
  while (readLineKeys.size > 5000) readLineKeys.delete(readLineKeys.values().next().value);
  try {
    localStorage.setItem(READ_LINES_KEY, JSON.stringify([...readLineKeys]));
  } catch (_) {}
  updateSkipReadControl();
}

function updateSkipReadControl() {
  const button = document.getElementById("skipRead");
  if (!button) return;
  const canSkip = state.phase !== "choice" && state.phase !== "complete" && readLineKeys.has(currentReadLineKey());
  button.disabled = !canSkip;
  button.setAttribute("aria-label", canSkip ? "跳過已讀內容直到下一段未讀內容" : "目前內容尚未讀完，無法跳過");
  const toolbarSkip = document.querySelector('.asset-toolbar [data-ui-action="skip"]');
  if (toolbarSkip) toolbarSkip.disabled = !canSkip;
}

function announceDialogue(text) {
  if (suppressDialogueAnnouncements || !text) return;
  const announcer = document.getElementById("storyAnnouncement");
  if (announcer) announcer.textContent = text;
}

function skipReadContent() {
  clearAutoAdvance();
  if (state.phase === "choice" || state.phase === "complete" || !readLineKeys.has(currentReadLineKey())) return;
  if (typingTimer) window.clearInterval(typingTimer);
  typingTimer = null;
  if (typingLine) {
    typingLine.node.textContent = typingLine.fullText;
    typingLine = null;
  }
  let steps = 0;
  suppressDialogueAnnouncements = true;
  try {
    while (
      state.phase !== "choice" &&
      state.phase !== "complete" &&
      readLineKeys.has(currentReadLineKey()) &&
      steps < 10000
    ) {
      const before = `${state.chapter}:${state.phase}:${state.line}`;
      advanceLine();
      const after = `${state.chapter}:${state.phase}:${state.line}`;
      steps += 1;
      if (before === after) break;
    }
  } finally {
    suppressDialogueAnnouncements = false;
  }
  if (state.phase === "choice") {
    announceDialogue(document.getElementById("story").textContent);
  } else if (state.phase === "complete") {
    const title = document.querySelector(".ending-card h2")?.textContent;
    const summary = document.querySelector(".ending-card .ending-summary")?.textContent;
    announceDialogue([title, summary].filter(Boolean).join("。"));
  }
  updateSkipReadControl();
}

function loadReadingSettings() {
  const defaults = { speed: 26, autoPlay: false, fontSize: 18 };
  try {
    const saved = JSON.parse(localStorage.getItem(READING_SETTINGS_KEY) || "null");
    const allowedSpeeds = [44, 26, 12];
    return {
      speed: allowedSpeeds.includes(saved?.speed) ? saved.speed : defaults.speed,
      autoPlay: saved?.autoPlay === true,
      fontSize: [16, 18, 20].includes(saved?.fontSize) ? saved.fontSize : defaults.fontSize
    };
  } catch (_) {
    return defaults;
  }
}

function loadAudioSettings() {
  const defaults = { bgmVolume: 0.55, sfxVolume: 0.65, enabled: true };
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) || "null");
    const clamp = value => Math.max(0, Math.min(1, Number(value)));
    return {
      bgmVolume: Number.isFinite(Number(saved?.bgmVolume)) ? clamp(saved.bgmVolume) : defaults.bgmVolume,
      sfxVolume: Number.isFinite(Number(saved?.sfxVolume)) ? clamp(saved.sfxVolume) : defaults.sfxVolume,
      enabled: saved?.enabled !== false
    };
  } catch (_) {
    return defaults;
  }
}

function saveAudioSettings() {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings));
  } catch (_) {}
}

function updateAudioControls() {
  const bgm = document.getElementById("bgmVolume");
  const sfx = document.getElementById("sfxVolume");
  if (bgm) bgm.value = String(audioSettings.bgmVolume);
  if (sfx) sfx.value = String(audioSettings.sfxVolume);
  const toggle = document.getElementById("audioToggle");
  if (toggle) {
    const label = toggle.querySelector(".audio-toggle-label");
    if (label) label.textContent = musicEnabled ? "音訊開" : "音訊關";
    toggle.setAttribute("aria-pressed", String(musicEnabled));
    toggle.setAttribute("aria-label", musicEnabled ? "關閉音訊" : "開啟音訊");
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
      announceDialogue(typingLine.announcementText);
      window.clearInterval(typingTimer);
      typingTimer = null;
      typingLine = null;
      markCurrentLineRead();
      document.getElementById("dialogueHint").textContent = "點擊／Enter／空白鍵 繼續　›";
      scheduleAutoAdvance();
    }
  }, readingSettings.speed);
}

function updateReadingControls() {
  const speed = document.getElementById("typingSpeed");
  const auto = document.getElementById("autoPlayToggle");
  const fontSize = document.getElementById("dialogueFontSize");
  if (speed) speed.value = String(readingSettings.speed);
  if (auto) auto.checked = readingSettings.autoPlay;
  document.querySelector('.asset-toolbar [data-ui-action="auto"]')?.setAttribute("aria-pressed", String(readingSettings.autoPlay));
  if (fontSize) fontSize.value = String(readingSettings.fontSize);
  document.documentElement.style.setProperty("--dialogue-font-size", `${readingSettings.fontSize}px`);
}

function getAutoSaveChapterOffset(saved, isCurrentKey) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return null;
  if (isCurrentKey) return [2, 3].includes(saved.version) ? 0 : null;
  return saved.version == null ? 3 : null;
}

function loadState() {
  let currentRaw = null;
  let hasStoredSave = false;
  try {
    currentRaw = localStorage.getItem(STORAGE_KEY);
    const hasCurrentKey = currentRaw !== null;
    const legacyRaw = hasCurrentKey ? null : localStorage.getItem(LEGACY_STORAGE_KEY);
    hasStoredSave = hasCurrentKey || legacyRaw !== null;
    const saved = JSON.parse((hasCurrentKey ? currentRaw : legacyRaw) || "null");
    const chapterOffset = getAutoSaveChapterOffset(saved, hasCurrentKey);
    const chapterIndex = Number.isInteger(saved?.chapter) && Number.isInteger(chapterOffset)
      ? saved.chapter + chapterOffset
      : -1;

    if (saved && chapterOffset !== null && chapterIndex >= 0 && chapterIndex < chapters.length) {
      const validRoutes = ["friend", "partner", "romance"];
      const validPhases = ["intro", "choice", "branch", "common", "complete"];
      const defaults = defaultState();
      const invalidPhase = !Object.prototype.hasOwnProperty.call(saved, "phase") || !validPhases.includes(saved.phase);
      const invalidLine = Object.prototype.hasOwnProperty.call(saved, "line") &&
        (!Number.isInteger(saved.line) || saved.line < 0);
      const invalidFlags = Object.prototype.hasOwnProperty.call(saved, "flags") &&
        (!saved.flags || typeof saved.flags !== "object" || Array.isArray(saved.flags) ||
          Object.entries(defaults.flags).some(([key]) => Object.prototype.hasOwnProperty.call(saved.flags, key) &&
            (!Number.isInteger(saved.flags[key]) || saved.flags[key] < 0)));
      const invalidChoices = Object.prototype.hasOwnProperty.call(saved, "choices") &&
        (!saved.choices || typeof saved.choices !== "object" || Array.isArray(saved.choices) ||
          Object.values(saved.choices).some(choice => !choice || typeof choice !== "object" || Array.isArray(choice) ||
            !["A", "B", "C"].includes(choice.letter)));
      const invalidRoute = Object.prototype.hasOwnProperty.call(saved, "route") &&
        saved.route !== null && !validRoutes.includes(saved.route);
      if (invalidPhase || invalidLine || invalidFlags || invalidChoices || invalidRoute) {
        autoSaveWriteBlocked = true;
        autoSaveWriteBlockedMessage = "自動存檔欄位格式無效；重新開始或讀入手動存檔可建立新進度。";
        return defaultState();
      }

      const restored = {
        ...defaultState(),
        ...saved,
        version: 2,
        chapter: chapterIndex,
        flags: { ...defaults.flags, ...(saved.flags || {}) },
        route: validRoutes.includes(saved.route) ? saved.route : null
      };
      if (!validPhases.includes(restored.phase)) {
        autoSaveWriteBlocked = true;
        autoSaveWriteBlockedMessage = "自動存檔內容無效；重新開始或讀入手動存檔可建立新進度。";
        return defaultState();
      }
      if (!Number.isInteger(restored.line) || restored.line < 0) restored.line = 0;

      // Reconcile saved flag totals when a chapter's choice-to-outcome mapping changes.
      if (restored.choices && typeof restored.choices === "object" && !Array.isArray(restored.choices)) {
        for (const [chapterId, selected] of Object.entries(restored.choices)) {
          const chapter = chapters.find(item => item.id === chapterId);
          const currentChoice = chapter?.choices?.find(choice => choice.letter === selected?.letter);
          if (!currentChoice?.flag || !selected || typeof selected !== "object") continue;
          if (selected.flag !== currentChoice.flag) {
            if (selected.flag && Object.prototype.hasOwnProperty.call(restored.flags, selected.flag)) {
              restored.flags[selected.flag] = Math.max(0, restored.flags[selected.flag] - 1);
            }
            restored.flags[currentChoice.flag] = (restored.flags[currentChoice.flag] || 0) + 1;
            selected.flag = currentChoice.flag;
            selected.hint = currentChoice.hint;
          }
        }
      }

      // Legacy saves gain the three newly playable prologue chapters at the front.
      if (restored.phase === "complete" && chapters[restored.chapter]?.id === "D07" && !restored.route) {
        restored.chapter = chapters.findIndex(item => item.id === "D06");
        restored.phase = "intro";
        restored.line = 0;
      } else if (restored.phase === "complete" && !chapters[restored.chapter]?.endOfRoute && restored.chapter < chapters.length - 1) {
        restored.chapter += 1;
        restored.phase = "intro";
        restored.line = 0;
      }
      return restored;
    }
    if (hasStoredSave) {
      autoSaveWriteBlocked = true;
      autoSaveWriteBlockedMessage = "自動存檔格式無效或不支援；重新開始或讀入手動存檔可建立新進度。";
    }
  } catch (_) {
    autoSaveWriteBlocked = true;
    autoSaveWriteBlockedMessage = "瀏覽器存檔無法讀取；自動存檔已暫停。";
  }
  return defaultState();
}

function cloneState(source) {
  return JSON.parse(JSON.stringify(source));
}

function saveState() {
  if (replayMode) {
    document.getElementById("saveState").textContent = "章節重玩｜主線存檔不變";
    return;
  }
  if (autoSaveWriteBlocked) {
    document.getElementById("saveState").textContent = autoSaveWriteBlockedMessage;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: 2 }));
    document.getElementById("saveState").textContent = "已自動保存";
  } catch (_) {
    document.getElementById("saveState").textContent = "自動存檔失敗：瀏覽器儲存空間不可用";
  }
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
  announceDialogue(typingLine.announcementText);
  typingLine = null;
  markCurrentLineRead();
  document.getElementById("dialogueHint").textContent = "點擊／Enter／空白鍵 繼續　›";
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
  let chapterChanged = false;
  let routeEndingReached = false;

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
    if (chapter.endOfRoute) { state.phase = "complete"; routeEndingReached = true; }
    else if (chapter.nextByRoute) {
      let nextIndex = chapter.nextByRoute[state.route] ? chapters.findIndex(item => item.id === chapter.nextByRoute[state.route]) : -1;
      if (nextIndex < 0) nextIndex = chapters.findIndex(item => item.id === "D06");
      if (nextIndex < 0) state.phase = "complete";
      else { state.chapter = nextIndex; state.phase = "intro"; chapterChanged = true; }
    } else if (state.chapter === chapters.length - 1) state.phase = "complete";
    else { state.chapter += 1; state.phase = "intro"; chapterChanged = true; }
  }
  render();
  if (chapterChanged) playChapterTransitionSound();
  if (routeEndingReached) playRouteEndingSound();
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
  sprite.className = sprite.dataset.emotion ? "hina-sprite user-cutout" : "hina-sprite";
  if (sprite.dataset.ready === "true") sprite.classList.add("sprite-ready");
  else sprite.classList.add("sprite-changing");
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
  const frame = SPRITE_FRAME_NORMALIZATION[source.slice(source.lastIndexOf("/") + 1)];
  if (frame) {
    const scale = SPRITE_REFERENCE_HEIGHT / frame.contentHeight;
    const baselineShift = ((SPRITE_FRAME_HEIGHT - frame.contentBottom) * scale -
      (SPRITE_FRAME_HEIGHT - SPRITE_REFERENCE_BOTTOM)) / SPRITE_FRAME_HEIGHT * 100;
    sprite.style.setProperty("--sprite-scale", scale.toFixed(4));
    sprite.style.setProperty("--sprite-baseline-shift", `${baselineShift.toFixed(4)}%`);
  }
  sprite.classList.add("user-cutout");
  sprite.classList.add("sprite-changing");
  sprite.onload = () => {
    sprite.onload = null;
    sprite.dataset.ready = "true";
    sprite.classList.add("sprite-ready");
    sprite.classList.remove("sprite-changing");
  };
  const useSvgFallback = () => {
    sprite.onerror = null;
    sprite.dataset.emotion = "";
    sprite.style.removeProperty("--sprite-scale");
    sprite.style.removeProperty("--sprite-baseline-shift");
    sprite.classList.remove("user-cutout");
    sprite.onload = () => {
      sprite.onload = null;
      sprite.dataset.ready = "true";
      sprite.classList.add("sprite-ready");
      sprite.classList.remove("sprite-changing");
    };
    sprite.src = SPRITE_FALLBACK;
  };
  sprite.onerror = () => {
    sprite.onerror = null;
    if (/\.webp$/i.test(source)) {
      sprite.onerror = useSvgFallback;
      sprite.src = source.replace(/\.webp$/i, ".png");
      return;
    }
    useSvgFallback();
  };
  sprite.src = source;
}

const BACKGROUND_BY_CHAPTER = {
  P01: "office-sunset-v01.webp", P02: "office-overcast-v01.webp", P03: "office-day-v01.webp",
  A01: "office-sunset-v01.webp", A02: "office-sunset-v01.webp", A03: "office-sunset-v01.webp",
  A04: "school-corridor-sunset-v01.webp", A05: "office-night-v01.webp", A06: "office-night-v01.webp",
  B01: "office-day-v01.webp", B02: "office-day-v01.webp", B03: "office-rainy-day-v01.webp",
  B04: "office-overcast-v01.webp", B05: "office-overcast-v01.webp", B06: "office-overcast-v01.webp",
  B07: "office-night-v01.webp", B08: "office-night-v01.webp",
  C01: "office-day-v01.webp", C02: "office-day-v01.webp", C03: "rooftop-sunset-v01.webp",
  C04: "office-overcast-v01.webp", C05: "office-day-v01.webp", C06: "school-gate-evening-v01.webp",
  D01: "cafe-day-v01.webp", D02: "cafe-rainy-evening-v01.webp", D03: "home-living-room-day-v01.webp",
  D04: "neighborhood-park-evening-v01.webp", D05: "cafe-day-v01.webp", D06: "home-living-room-day-v01.webp",
  D07: "neighborhood-park-evening-v01.webp", D08F: "cafe-day-v01.webp", D08P: "neighborhood-park-evening-v01.webp",
  D08R: "cafe-rainy-evening-v01.webp"
};

const SCENE_BY_CHAPTER = {
  P01: "office", P02: "office", P03: "office",
  A01: "office", A02: "office", A03: "office", A04: "corridor", A05: "office", A06: "office",
  B01: "office", B02: "office", B03: "office", B04: "office", B05: "office", B06: "office", B07: "office", B08: "office",
  C01: "office", C02: "office", C03: "rooftop", C04: "office", C05: "office", C06: "outdoor",
  D01: "cafe", D02: "cafe", D03: "home", D04: "outdoor", D05: "cafe", D06: "home", D07: "outdoor",
  D08F: "cafe", D08P: "outdoor", D08R: "cafe"
};

const MUSIC_PROFILES = {
  office: { notes: [220, 277.18, 329.63], type: "sine" },
  corridor: { notes: [196, 246.94, 293.66], type: "triangle" },
  rooftop: { notes: [164.81, 207.65, 246.94], type: "sine" },
  cafe: { notes: [174.61, 220, 261.63], type: "triangle" },
  home: { notes: [196, 233.08, 293.66], type: "sine" },
  outdoor: { notes: [185, 233.08, 277.18], type: "sine" }
};

function updateScene() {
  const chapter = chapters[state.chapter];
  const scene = document.getElementById("sceneArt");
  const selected = chapter ? state.choices[chapter.id]?.letter : null;
  const roofScene = ["P01", "P02"].includes(chapter?.id) && state.phase === "branch" && selected === "C";
  const sceneType = roofScene ? "rooftop" : (SCENE_BY_CHAPTER[chapter?.id] || "office");
  activeSceneType = sceneType;
  if (audioContext && ambientNodes.length && currentMusicScene !== sceneType) transitionAmbient(sceneType);
  const previousSceneType = scene.dataset.sceneType || "";
  const previousChapter = scene.dataset.chapter || "";
  const shouldTransition = (previousSceneType && previousSceneType !== sceneType) ||
    (previousChapter && previousChapter !== (chapter?.id || ""));
  const backgroundFile = roofScene ? "rooftop-sunset-v01.webp" : (BACKGROUND_BY_CHAPTER[chapter?.id] || null);
  scene.className = "scene-art " + sceneType + (backgroundFile ? " has-background" : "");
  if (backgroundFile) scene.style.setProperty("--scene-image", `url("assets/backgrounds/${backgroundFile}")`);
  else scene.style.removeProperty("--scene-image");
  if (previousChapter && previousChapter !== (chapter?.id || "") && chapter) {
    const toast = document.getElementById("chapterToast");
    if (toast) {
      toast.textContent = `${chapter.id}｜${chapter.title}`;
      toast.classList.remove("is-visible");
      void toast.offsetWidth;
      toast.classList.add("is-visible");
    }
  }
  if (shouldTransition) {
    scene.classList.remove("scene-transition");
    void scene.offsetWidth;
    scene.classList.add("scene-transition");
  }
  scene.dataset.sceneType = sceneType;
  scene.dataset.chapter = chapter?.id || "";
  setMood(chapter?.mood || "認真");
  const sprite = document.getElementById("hinaSprite");
  if (!sprite.dataset.emotion) setSpriteEmotion(chapter?.mood || "認真");

  if (state.phase === "choice") setMood("等待選擇");
  if (state.phase === "complete") setMood("目前內容完成");
}

function addHistoryEntry(kind, text) {
  const chapter = chapters[state.chapter];
  const key = `${chapter?.id || "?"}:${state.phase}:${state.line}`;
  if (key === lastHistoryKey) return;
  lastHistoryKey = key;
  const historySpeakers = { hina: "空崎陽奈", system: "系統" };
  dialogueHistory.push({
    chapter: chapter?.id || "",
    speaker: historySpeakers[kind] || "",
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
    article.className = entry.speaker === "你的選擇" ? "log-entry choice-log-entry" : "log-entry";
    const meta = document.createElement("div");
    meta.className = "log-meta";
    meta.textContent = [entry.chapter, entry.speaker].filter(Boolean).join(" · ");
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
  else document.getElementById("utilityMenuTrigger")?.focus();
}

function setStageCue(cue) {
  const stage = document.getElementById("gameStage");
  stage.dataset.stageCue = ["close", "wide"].includes(cue) ? cue : "";
}

const choiceSummaries = {
  P01: { A: "休息", B: "分擔", C: "點心" },
  P02: { A: "休息", B: "分工", C: "校外" },
  P03: { A: "心願", B: "分工", C: "約定" },
  A01: { A: "疲憊", B: "起步", C: "近況" },
  A02: { A: "休息", B: "分工", C: "回想" },
  A03: { A: "休息", B: "交付", C: "暫用" },
  A04: { A: "保管", B: "清單", C: "同行" },
  A05: { A: "休息", B: "回查", C: "看窗" },
  A06: { A: "先休", B: "分工", C: "普通事" },
  B01: { A: "留時間", B: "初核", C: "排序" },
  B02: { A: "留時間", B: "初核", C: "回查" },
  B03: { A: "補漏", B: "修規則", C: "困難" },
  B04: { A: "統一", B: "誤解", C: "流程" },
  B05: { A: "延後", B: "初核", C: "排序" },
  B06: { A: "收尾", B: "交付", C: "排程" },
  B07: { A: "分界", B: "熱飲", C: "放手" },
  B08: { A: "散步", B: "喝水", C: "停筆" },
  C01: { A: "首輪", B: "共巡", C: "整理" },
  C02: { A: "判斷", B: "休息", C: "交接" },
  C03: { A: "校園", B: "操場", C: "未知" },
  C04: { A: "助人", B: "舊檔", C: "帶走" },
  C05: { A: "回報", B: "巡查", C: "責任" },
  C06: { A: "便條", B: "靜坐", C: "未來" },
  D01: { A: "稱呼", B: "重逢", C: "近況" },
  D02: { A: "介入", B: "分享", C: "做得好" },
  D03: { A: "減量", B: "休息", C: "晚餐" },
  D04: { A: "採買", B: "小店", C: "自選" },
  D05: { A: "認識", B: "回憶", C: "留白" },
  D06: { A: "朋友", B: "搭檔", C: "戀愛" },
  D07: { A: "咖啡", B: "河邊", C: "十分鐘" },
  D08F: { A: "讀書", B: "支持", C: "邀約" },
  D08P: { A: "分工", B: "彈性", C: "試做" },
  D08R: { A: "交往", B: "界線", C: "暫緩" }
};

function getChoiceNotice(choice, chapterId) {
  const routeNames = { friend: "朋友線", partner: "搭檔線", romance: "戀愛線" };
  const routeSummaries = { friend: "朋友", partner: "搭檔", romance: "戀愛" };
  const memorySummaries = {
    "互相支持": "支持",
    "互相選擇": "選擇",
    "休息": "休息",
    "保留時間": "留白",
    "分工": "分工",
    "實作": "實作",
    "建立界線": "界線",
    "戀愛線": "戀愛",
    "搭檔線": "搭檔",
    "日常": "日常",
    "朋友線": "朋友",
    "界線": "界線",
    "約定": "約定"
  };
  if (choice.route) {
    return { marker: routeSummaries[choice.route] || "關係", description: `路線告知：${routeNames[choice.route] || "關係路線"}` };
  }
  const hint = String(choice.hint || "");
  const marker = choiceSummaries[chapterId]?.[choice.letter] || memorySummaries[hint] || [...hint].slice(0, 2).join("") || "選項";
  return { marker, description: `後續回憶：${hint}` };
}

function renderDialogue([kind, text, mood, stageCue]) {
  if (typingTimer) window.clearInterval(typingTimer);
  typingTimer = null;
  typingLine = null;
  clearAutoAdvance();
  const story = document.getElementById("story");
  const announcer = document.getElementById("storyAnnouncement");
  const speakerName = document.getElementById("speakerName");
  if (announcer) announcer.textContent = "";
  const speakerLabels = { hina: "空崎陽奈", narration: "", system: "系統" };
  speakerName.textContent = speakerLabels[kind] ?? "";
  speakerName.hidden = !(kind in speakerLabels);
  setStageCue(kind === "hina" ? stageCue : "");
  story.replaceChildren();
  const p = document.createElement("p");
  const textNode = document.createTextNode("");

  if (kind === "hina") {
    p.className = "hina";
  } else if (kind === "system") {
    p.className = "system";
  } else {
    p.className = "narration";
  }
  p.appendChild(textNode);
  story.appendChild(p);
  if (kind === "hina") setSpriteEmotion(mood);
  animateSprite(kind, text);
  addHistoryEntry(kind, text);

  const characters = Array.from(text);
  if (!characters.length) {
    markCurrentLineRead();
    document.getElementById("dialogueHint").textContent = "點擊／Enter／空白鍵 繼續　›";
    updateSkipReadControl();
    return;
  }
  const speaker = speakerLabels[kind] || "";
  typingLine = { characters, fullText: text, node: textNode, index: 0, announcementText: speaker ? `${speaker}：${text}` : text };
  document.getElementById("dialogueHint").textContent = "點擊／Enter／空白鍵 顯示完整句";
  updateSkipReadControl();
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
  const speakerName = document.getElementById("speakerName");
  speakerName.textContent = "";
  speakerName.hidden = true;
  setStageCue("");
  document.getElementById("gameStage").dataset.phase = state.phase;

  const routeLabel = (["D06", "D07"].includes(chapter.id) || chapter.routeEnding) ? ({ friend: "朋友線", partner: "搭檔線", romance: "戀愛線" })[state.route] : "";
  const chapterLabel = document.getElementById("chapterLabel");
  const labelChanged = chapterLabel.dataset.chapter && chapterLabel.dataset.chapter !== chapter.id;
  chapterLabel.textContent = `${chapter.id}｜${chapter.title}${routeLabel ? "｜" + routeLabel : ""}`;
  chapterLabel.dataset.chapter = chapter.id;
  if (labelChanged) {
    chapterLabel.classList.remove("chapter-label-enter");
    void chapterLabel.offsetWidth;
    chapterLabel.classList.add("chapter-label-enter");
  }
  document.getElementById("returnMain").hidden = !replayMode;
  document.getElementById("saveManual").disabled = replayMode;
  document.getElementById("progress").style.width = `${state.phase === "complete" ? 100 : ((state.chapter + 1) / chapters.length) * 100}%`;
  renderFlags();
  updateScene();

  const box = document.getElementById("choices");
  box.dataset.selecting = "false";
  box.replaceChildren();

  if (state.phase === "choice") {
    const prompt = document.createElement("p");
    prompt.className = "narration";
    prompt.textContent = "陽奈等著你回答。選項會標示路線告知或後續回憶。";
    document.getElementById("story").replaceChildren(prompt);
    announceDialogue(prompt.textContent);
    document.getElementById("dialogueHint").textContent = "請選擇一項";
    chapter.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice choice-enter";
      button.style.animationDelay = `${index * 55}ms`;
      button.dataset.choice = choice.letter;
      const notice = getChoiceNotice(choice, chapter.id);
      const marker = document.createElement("span");
      marker.className = "choice-marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = notice.marker;
      const label = document.createElement("span");
      label.className = "choice-label";
      label.textContent = choice.label;
      const hint = document.createElement("small");
      hint.className = "choice-hint";
      hint.id = `choice-hint-${choice.letter}`;
      hint.textContent = notice.description;
      button.setAttribute("aria-describedby", hint.id);
      button.append(marker, label, hint);
      button.addEventListener("click", () => {
        if (box.dataset.selecting === "true") return;
        box.dataset.selecting = "true";
        box.querySelectorAll(".choice").forEach(option => {
          const selected = option === button;
          option.classList.toggle("is-selected", selected);
          option.setAttribute("aria-pressed", String(selected));
          option.disabled = !selected;
        });
        const confirmChoice = () => choose(choice);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) confirmChoice();
        else window.setTimeout(confirmChoice, 110);
      });
      box.appendChild(button);
    });
  } else if (state.phase === "complete") {
    const routeNames = { friend: "朋友線", partner: "搭檔線", romance: "戀愛線" };
    const routeSummaries = {
      friend: "以自在分享、互相支持與保留空間延續友誼。",
      partner: "以平等分工、共同目標與互相信任延續合作。",
      romance: "以成年後的雙向選擇、尊重與溝通為基礎，慢慢建立新的關係。"
    };
    const story = document.getElementById("story");
    const card = document.createElement("section");
    card.className = "ending-card";
    card.setAttribute("aria-labelledby", "endingCardTitle");
    const eyebrow = document.createElement("p");
    eyebrow.className = "ending-eyebrow";
    eyebrow.textContent = "ROUTE COMPLETE";
    const title = document.createElement("h2");
    title.id = "endingCardTitle";
    title.textContent = (routeNames[state.route] || "故事") + "結局";
    const summary = document.createElement("p");
    summary.className = "ending-summary";
    summary.textContent = routeSummaries[state.route] || "本次遊玩內容已完成。";
    announceDialogue(`${title.textContent}。${summary.textContent}`);
    const description = document.createElement("p");
    description.className = "narration";
    description.textContent = "已完成 30 節共通篇並抵達路線結局。你的選擇與旗標會保存在這個瀏覽器中；也可以從章節選單回看其他段落。";
    const flags = document.createElement("p");
    flags.className = "system";
    flags.textContent = `rest ${state.flags.rest}｜teamwork ${state.flags.teamwork}｜ordinary_day ${state.flags.ordinary_day}｜daily_checkin ${state.flags.daily_checkin}｜self_rest ${state.flags.self_rest}`;
    card.append(eyebrow, title, summary, description, flags);
    story.replaceChildren(card);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next";
    button.textContent = "重新開始完整體驗版";
    button.addEventListener("click", restart);
    const chapterButton = document.createElement("button");
    chapterButton.type = "button";
    chapterButton.className = "next secondary";
    chapterButton.textContent = "回到章節選單";
    chapterButton.addEventListener("click", openChapterMenu);
    box.append(button, chapterButton);
  } else {
    renderDialogue(currentLine());
  }
  updateSkipReadControl();
  saveState();
}

function choose(choice) {
  const chapter = chapters[state.chapter];
  if (choice.flag) state.flags[choice.flag] = (state.flags[choice.flag] || 0) + 1;
  if (choice.route) state.route = choice.route;
  if (chapter.id === "A06") state.flags.daily_checkin += 1;
  state.choices[chapter.id] = choice;
  dialogueHistory.push({ chapter: chapter.id, speaker: "你的選擇", text: choice.label });
  if (dialogueHistory.length > 500) dialogueHistory.shift();
  renderHistory();
  state.phase = "branch";
  state.line = 0;
  render();
  document.getElementById("gameStage").focus({ preventScroll: true });
  playConfirmSound();
}

function restart() {
  const message = replayMode
    ? "要重新開始目前的重玩章節嗎？主線存檔不會受到影響。"
    : "要從序章重新開始嗎？目前自動存檔會更新。";
  if (!window.confirm(message)) return;
  if (replayMode) {
    const chapterIndex = state.chapter;
    const preservedFlags = { ...state.flags };
    const preservedRoute = state.route;
    state = defaultState();
    state.chapter = chapterIndex;
    state.flags = preservedFlags;
    state.route = preservedRoute;
  } else {
    autoSaveWriteBlocked = false;
    autoSaveWriteBlockedMessage = "";
    state = defaultState();
  }
  dialogueHistory = [];
  lastHistoryKey = "";
  renderHistory();
  render();
  playConfirmSound();
}

function returnToMain() {
  if (!replayMode || !mainStateSnapshot) return;
  state = mainStateSnapshot;
  mainStateSnapshot = null;
  replayMode = false;
  dialogueHistory = [];
  lastHistoryKey = "";
  renderHistory();
  render();
  document.getElementById("saveState").textContent = "已返回主線進度";
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
      if (!replayMode) {
        mainStateSnapshot = cloneState(state);
        replayMode = true;
      }
      state = cloneState(mainStateSnapshot);
      state.chapter = index;
      if (chapter.routeEnding) state.route = chapter.routeEnding;
      state.phase = "intro";
      state.line = 0;
      document.getElementById("chapterDialog").close();
      dialogueHistory = [];
      lastHistoryKey = "";
      renderHistory();
      render();
      playChapterTransitionSound();
    });
    list.appendChild(button);
  });
  document.getElementById("chapterDialog").showModal();
}

function loadManualSlots() {
  manualSaveWriteBlocked = false;
  manualSaveWriteBlockedMessage = "";
  try {
    const storedRaw = localStorage.getItem(MANUAL_SLOTS_KEY);
    if (storedRaw !== null) {
      const stored = JSON.parse(storedRaw);
      if (!Array.isArray(stored) || stored.length > MANUAL_SLOT_COUNT) {
        manualSaveWriteBlocked = true;
        manualSaveWriteBlockedMessage = "手動存檔格式無法辨識，已暫停寫入以保留原始資料。";
        return Array.from({ length: MANUAL_SLOT_COUNT }, (_, index) =>
          Array.isArray(stored) ? normalizeManualSave(stored[index] || null) : null
        );
      }
      const slots = Array.from({ length: MANUAL_SLOT_COUNT }, (_, index) => normalizeManualSave(stored[index] || null));
      if (stored.some((saved, index) => saved !== null && !isValidManualSave(slots[index]))) {
        manualSaveWriteBlocked = true;
        manualSaveWriteBlockedMessage = "手動存檔欄位含有損壞或不支援的資料，已暫停寫入以保留原始內容。";
        return slots;
      }
      if (JSON.stringify(slots) !== JSON.stringify(Array.from({ length: MANUAL_SLOT_COUNT }, (_, index) => stored[index] || null))) {
        localStorage.setItem(MANUAL_SLOTS_KEY, JSON.stringify(slots));
      }
      return slots;
    }
    const legacyRaw = localStorage.getItem(MANUAL_SAVE_KEY);
    const legacy = JSON.parse(legacyRaw || "null");
    const slots = Array(MANUAL_SLOT_COUNT).fill(null);
    const migrated = normalizeManualSave(legacy);
    if (migrated && isValidManualSave(migrated)) {
      slots[0] = migrated;
      localStorage.setItem(MANUAL_SLOTS_KEY, JSON.stringify(slots));
    } else if (legacyRaw !== null) {
      manualSaveWriteBlocked = true;
      manualSaveWriteBlockedMessage = "舊版手動存檔無法辨識，已保留原始資料並暫停寫入。";
      slots[0] = migrated;
    }
    return slots;
  } catch (_) {
    manualSaveWriteBlocked = true;
    manualSaveWriteBlockedMessage = "手動存檔無法讀取，已暫停寫入以保留原始資料。";
    return Array(MANUAL_SLOT_COUNT).fill(null);
  }
}

function normalizeManualSave(saved) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved) || saved.version === 3) return saved;
  if (!Number.isInteger(saved.chapter)) return saved;
  const chapterOffset = saved.version == null ? 3 : saved.version === 2 ? 0 : null;
  if (chapterOffset === null) return saved;
  const migrated = {
    ...saved,
    version: 3,
    chapter: saved.chapter + chapterOffset
  };
  return isValidManualSave(migrated) ? migrated : saved;
}

function isValidManualSave(saved) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved) || saved.version !== 3) return false;
  if (!Number.isInteger(saved.chapter) || saved.chapter < 0 || saved.chapter >= chapters.length) return false;
  if (!["intro", "choice", "branch", "common", "complete"].includes(saved.phase)) return false;
  if (!Number.isInteger(saved.line) || saved.line < 0) return false;
  if (saved.route != null && !["friend", "partner", "romance"].includes(saved.route)) return false;
  if (saved.phase === "complete") return !!chapters[saved.chapter]?.endOfRoute || chapters[saved.chapter]?.id === "D07";
  const chapter = chapters[saved.chapter];
  if (saved.phase === "choice") return saved.line === 0;
  let sequence = [];
  if (saved.phase === "intro") {
    sequence = [...(chapter.intro || [])];
    if (Array.isArray(chapter.flaggedIntro)) {
      const flags = saved.flags && typeof saved.flags === "object" ? saved.flags : {};
      sequence.push(...chapter.flaggedIntro
        .filter(item => Number(flags[item.flag] || 0) >= (item.min || 1))
        .flatMap(item => item.lines || []));
    }
  } else if (saved.phase === "branch") {
    const selected = saved.choices?.[chapter.id]?.letter;
    if (!["A", "B", "C"].includes(selected)) return false;
    sequence = chapter.branches?.[selected] || [];
  } else if (saved.phase === "common") {
    sequence = chapter.common || [];
  }
  sequence = sequence.filter(line => Array.isArray(line) && String(line[1] || "").trim());
  if (saved.line >= sequence.length) return false;
  if (saved.choices !== undefined && (!saved.choices || typeof saved.choices !== "object" || Array.isArray(saved.choices))) return false;
  if (saved.flags !== undefined && (!saved.flags || typeof saved.flags !== "object" || Array.isArray(saved.flags))) return false;
  return true;
}

function openSaveMenu(mode) {
  saveDialogMode = mode;
  loadManualSlots();
  document.getElementById("saveDialogTitle").textContent = mode === "save" ? "選擇存檔欄位" : "讀取存檔";
  document.getElementById("saveDialogNote").textContent = manualSaveWriteBlocked
    ? manualSaveWriteBlockedMessage
    : mode === "save"
      ? (replayMode ? "章節重玩期間不能覆蓋主線存檔。" : "選擇一個欄位保存目前進度；已有資料的欄位會先詢問是否覆蓋。")
      : "選擇要載入的進度。讀取主線存檔會結束目前的章節重玩。";
  renderSaveSlots();
  document.getElementById("saveDialog").showModal();
}

function estimateSaveProgress(saved) {
  if (saved.phase === "complete") return 100;
  const chapter = chapters[saved.chapter];
  const bands = {
    intro: [0, 0.4],
    choice: [0.4, 0.46],
    branch: [0.46, 0.8],
    common: [0.8, 1]
  };
  const [start, end] = bands[saved.phase] || [0, 0];
  let sequence = [];
  if (saved.phase === "intro") {
    sequence = [...(chapter.intro || [])];
    if (Array.isArray(chapter.flaggedIntro)) {
      const flags = saved.flags || {};
      sequence.push(...chapter.flaggedIntro
        .filter(item => Number(flags[item.flag] || 0) >= (item.min || 1))
        .flatMap(item => item.lines || []));
    }
  } else if (saved.phase === "branch") {
    const letter = saved.choices?.[chapter.id]?.letter;
    sequence = chapter.branches?.[letter] || [];
  } else if (saved.phase === "common") {
    sequence = chapter.common || [];
  }
  sequence = sequence.filter(line => Array.isArray(line) && String(line[1] || "").trim());
  const ratio = sequence.length ? Math.min(1, (saved.line + 1) / sequence.length) : 0;
  const chapterRatio = start + (end - start) * ratio;
  return Math.max(0, Math.min(100, Math.round(((saved.chapter + chapterRatio) / chapters.length) * 100)));
}

function renderSaveSlots() {
  const list = document.getElementById("saveSlots");
  list.replaceChildren();
  const slots = loadManualSlots();
  slots.forEach((saved, index) => {
    const article = document.createElement("article");
    article.className = "save-slot";
    const heading = document.createElement("strong");
    heading.className = "save-slot-title";
    heading.textContent = `存檔欄位 ${index + 1}`;
    const preview = document.createElement("div");
    const chapter = saved && isValidManualSave(saved) ? chapters[saved.chapter] : null;
    const sceneType = chapter ? (SCENE_BY_CHAPTER[chapter.id] || "office") : "empty";
    preview.className = `save-slot-preview ${sceneType}`;
    const previewBackground = chapter ? BACKGROUND_BY_CHAPTER[chapter.id] : null;
    if (previewBackground) {
      preview.style.backgroundImage = `linear-gradient(0deg, #080710a8, #08071012), url("assets/backgrounds/${previewBackground}")`;
      preview.style.backgroundSize = "cover";
      preview.style.backgroundPosition = "center";
    }
    const previewLabel = document.createElement("span");
    previewLabel.textContent = chapter ? chapter.id : "EMPTY";
    preview.appendChild(previewLabel);
    const detail = document.createElement("p");
    detail.className = "save-slot-detail";
    if (chapter) {
      const phaseNames = { intro: "劇情中", choice: "等待選擇", branch: "分支中", common: "共通劇情", complete: "內容完成" };
      const date = saved.savedAt ? new Date(saved.savedAt) : null;
      const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleString("zh-TW") : "時間未記錄";
      const flags = Object.entries(saved.flags || {}).filter(([, value]) => Number(value) > 0)
        .map(([name, value]) => `${name} ${value}`).join(" · ");
      const phaseProgress = { intro: 0.15, choice: 0.3, branch: 0.55, common: 0.8, complete: 1 }[saved.phase] || 0;
      const progress = saved.phase === "complete" ? 100 : Math.min(100, Math.round(((saved.chapter + phaseProgress) / chapters.length) * 100));
      const routeName = ({ friend: "朋友線", partner: "搭檔線", romance: "戀愛線" })[saved.route] || "";
      detail.textContent = `${chapter.id}｜${chapter.title} · ${phaseNames[saved.phase]}${routeName ? " · " + routeName : ""}\n全篇進度約 ${progress}% · ${dateText}${flags ? "\n" + flags : ""}`;
    } else {
      detail.textContent = saved ? "存檔格式無效或不支援" : "空欄位";
    }
    const action = document.createElement("button");
    action.type = "button";
    action.className = "save-slot-action";
    if (saveDialogMode === "save") {
      action.textContent = "儲存到此欄";
      action.disabled = replayMode || manualSaveWriteBlocked;
      action.addEventListener("click", () => saveManualSlot(index));
    } else {
      action.textContent = "讀取此欄";
      action.disabled = !chapter;
      action.addEventListener("click", () => loadManualSlot(index));
    }
    article.append(heading, preview, detail, action);
    list.appendChild(article);
  });
}

function saveManualSlot(index) {
  if (replayMode) {
    document.getElementById("saveState").textContent = "章節重玩不會覆蓋主線存檔";
    return;
  }
  const slots = loadManualSlots();
  if (manualSaveWriteBlocked) {
    document.getElementById("saveState").textContent = manualSaveWriteBlockedMessage;
    return;
  }
  if (slots[index] && !window.confirm(`確定覆蓋存檔欄位 ${index + 1} 嗎？`)) return;
  try {
    slots[index] = {
      ...cloneState(state),
      version: 3,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(MANUAL_SLOTS_KEY, JSON.stringify(slots));
    document.getElementById("saveDialog").close();
    document.getElementById("saveState").textContent = `手動存檔完成（欄位 ${index + 1}）`;
  } catch (_) {
    document.getElementById("saveState").textContent = "存檔失敗：儲存空間不可用";
  }
}

function loadManualSlot(index) {
  const saved = loadManualSlots()[index];
  if (!isValidManualSave(saved)) {
    document.getElementById("saveState").textContent = "存檔格式無效或已損壞";
    return;
  }
  const defaults = defaultState().flags;
  const flags = { ...defaults };
  Object.keys(defaults).forEach(key => {
    const value = Number(saved.flags?.[key] ?? 0);
    flags[key] = Number.isFinite(value) && value >= 0 ? value : 0;
  });
  state = {
    ...defaultState(),
    ...saved,
    version: 3,
    choices: saved.choices && typeof saved.choices === "object" ? saved.choices : {},
    flags,
    route: ["friend", "partner", "romance"].includes(saved.route) ? saved.route : null
  };
  autoSaveWriteBlocked = false;
  autoSaveWriteBlockedMessage = "";
  if (state.phase === "complete" && chapters[state.chapter]?.id === "D07" && !state.route) {
    state.chapter = chapters.findIndex(item => item.id === "D06");
    state.phase = "intro";
    state.line = 0;
  }
  replayMode = false;
  mainStateSnapshot = null;
  dialogueHistory = [];
  lastHistoryKey = "";
  renderHistory();
  document.getElementById("saveDialog").close();
  render();
  document.getElementById("saveState").textContent = `已讀取存檔欄位 ${index + 1}`;
}

function saveManual() {
  if (replayMode) {
    document.getElementById("saveState").textContent = "章節重玩不會覆蓋主線存檔";
    return;
  }
  openSaveMenu("save");
}

function loadManual() {
  openSaveMenu("load");
}

function ensureAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
}

function createAmbient(sceneType, fadeSeconds = 0.7) {
  ensureAudio();
  const profile = MUSIC_PROFILES[sceneType] || MUSIC_PROFILES.office;
  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(0.018 * audioSettings.bgmVolume, now + fadeSeconds);
  master.connect(audioContext.destination);

  const nodes = [];
  profile.notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const voiceGain = audioContext.createGain();
    oscillator.type = profile.type;
    oscillator.frequency.value = frequency;
    voiceGain.gain.value = index === 0 ? 0.9 : 0.34;
    oscillator.connect(voiceGain).connect(master);
    oscillator.start(now);
    nodes.push(oscillator);
  });
  nodes.push(master);
  ambientNodes = nodes;
  ambientMaster = master;
  currentMusicScene = sceneType;
}

function startAmbient() {
  if (!musicEnabled) return;
  // A prior autoplay timeout may have created nodes before a user gesture.
  // Always retry resume from the current interaction, even when nodes already exist.
  if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
  if (ambientNodes.length) return;
  createAmbient(activeSceneType);
}

function transitionAmbient(sceneType) {
  if (!musicEnabled || !audioContext || !ambientNodes.length || currentMusicScene === sceneType) return;
  const oldNodes = ambientNodes;
  const oldMaster = ambientMaster;
  const now = audioContext.currentTime;
  if (oldMaster) {
    oldMaster.gain.cancelScheduledValues(now);
    oldMaster.gain.setTargetAtTime(0, now, 0.12);
  }
  oldNodes.forEach(node => {
    if (node !== oldMaster && typeof node.stop === "function") {
      try { node.stop(now + 0.65); } catch (_) {}
    }
  });
  window.setTimeout(() => {
    oldNodes.forEach(node => {
      if (typeof node.disconnect === "function") node.disconnect();
    });
  }, 800);
  ambientNodes = [];
  ambientMaster = null;
  currentMusicScene = null;
  createAmbient(sceneType, 0.75);
}

function stopAmbient() {
  const oldNodes = ambientNodes;
  const oldMaster = ambientMaster;
  if (audioContext && oldMaster) {
    const now = audioContext.currentTime;
    oldMaster.gain.cancelScheduledValues(now);
    oldMaster.gain.setTargetAtTime(0, now, 0.06);
    oldNodes.forEach(node => {
      if (node !== oldMaster && typeof node.stop === "function") {
        try { node.stop(now + 0.3); } catch (_) {}
      }
    });
    window.setTimeout(() => {
      oldNodes.forEach(node => {
        if (typeof node.disconnect === "function") node.disconnect();
      });
    }, 450);
  } else {
    oldNodes.forEach(node => {
      if (typeof node.stop === "function") node.stop();
      if (typeof node.disconnect === "function") node.disconnect();
    });
  }
  ambientNodes = [];
  ambientMaster = null;
  currentMusicScene = null;
}

function playChapterTransitionSound() {
  if (!musicEnabled || audioSettings.sfxVolume <= 0) return;
  ensureAudio();
  [523.25, 659.25].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + index * 0.11;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.035 * audioSettings.sfxVolume, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.36);
  });
}

function playRouteEndingSound() {
  if (!musicEnabled || audioSettings.sfxVolume <= 0) return;
  ensureAudio();
  // A quiet three-note cadence distinguishes a route ending from an ordinary chapter change.
  [392, 493.88, 587.33].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + index * 0.16;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.045 * audioSettings.sfxVolume, start + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.52);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.54);
  });
}

function playConfirmSound() {
  if (!musicEnabled || audioSettings.sfxVolume <= 0) return;
  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  gain.gain.setValueAtTime(0.08 * audioSettings.sfxVolume, audioContext.currentTime);
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
document.getElementById("skipRead").addEventListener("click", skipReadContent);
document.getElementById("logToggle").addEventListener("click", () => toggleHistory());
document.getElementById("logClose").addEventListener("click", () => toggleHistory(false));
document.getElementById("closeSaveMenu").addEventListener("click", () => document.getElementById("saveDialog").close());
document.getElementById("returnMain").addEventListener("click", returnToMain);
document.getElementById("dialogueFontSize").addEventListener("change", event => {
  readingSettings.fontSize = [16, 18, 20].includes(Number(event.currentTarget.value)) ? Number(event.currentTarget.value) : 18;
  document.documentElement.style.setProperty("--dialogue-font-size", `${readingSettings.fontSize}px`);
  saveReadingSettings();
});
document.getElementById("typingSpeed").addEventListener("change", event => {
  readingSettings.speed = Number(event.currentTarget.value);
  saveReadingSettings();
  if (typingLine) startTypewriterTimer();
});
document.getElementById("autoPlayToggle").addEventListener("change", event => {
  readingSettings.autoPlay = event.currentTarget.checked;
  document.querySelector('.asset-toolbar [data-ui-action="auto"]')?.setAttribute("aria-pressed", String(readingSettings.autoPlay));
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
document.querySelector(".asset-toolbar").addEventListener("click", event => {
  const button = event.target.closest("button[data-ui-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.uiAction;
  if (action === "config") {
    toggleHistory(true);
    return;
  }
  const targetIds = {
    log: "logToggle",
    auto: "autoPlayToggle",
    skip: "skipRead",
    save: "saveManual",
    load: "loadManual"
  };
  document.getElementById(targetIds[action])?.click();
});
document.getElementById("audioToggle").addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  audioSettings.enabled = musicEnabled;
  saveAudioSettings();
  updateAudioControls();
  if (musicEnabled) startAmbient();
  else stopAmbient();
});

const utilityMenu = document.getElementById("utilityMenu");
const utilityMenuTrigger = document.getElementById("utilityMenuTrigger");
utilityMenu.addEventListener("toggle", () => {
  utilityMenuTrigger.setAttribute("aria-expanded", String(utilityMenu.open));
});
utilityMenu.addEventListener("click", event => {
  if (!event.target.closest(".utility-menu-item")) return;
  utilityMenu.open = false;
  window.requestAnimationFrame(() => {
    const openDialog = document.querySelector("dialog[open]");
    if (openDialog) openDialog.querySelector("button:not(:disabled)")?.focus();
    else if (document.getElementById("logPanel").classList.contains("is-open")) document.getElementById("logClose").focus();
    else utilityMenuTrigger.focus();
  });
});
document.addEventListener("click", event => {
  if (!utilityMenu.open || utilityMenu.contains(event.target)) return;
  utilityMenu.open = false;
  if (event.target.closest("#gameStage")) event.stopPropagation();
}, true);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && utilityMenu.open) {
    utilityMenu.open = false;
    utilityMenuTrigger.focus();
  }
});
document.getElementById("bgmVolume").addEventListener("input", event => {
  audioSettings.bgmVolume = Math.min(1, Math.max(0, Number(event.currentTarget.value)));
  saveAudioSettings();
  if (ambientMaster) ambientMaster.gain.setTargetAtTime(0.018 * audioSettings.bgmVolume, audioContext.currentTime, 0.06);
  else if (musicEnabled && audioSettings.bgmVolume > 0) startAmbient();
});
document.getElementById("sfxVolume").addEventListener("input", event => {
  audioSettings.sfxVolume = Math.min(1, Math.max(0, Number(event.currentTarget.value)));
  saveAudioSettings();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.getElementById("logPanel").classList.contains("is-open")) {
    toggleHistory(false);
    return;
  }
  if (event.target.closest("button, a, summary, input, select, textarea") || utilityMenu.open || document.querySelector("dialog[open]") || document.getElementById("logPanel").classList.contains("is-open")) return;
  if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
    if (state.phase !== "choice" && state.phase !== "complete") {
      event.preventDefault();
      advanceLine();
    }
  }
});

updateReadingControls();
updateAudioControls();
render();
