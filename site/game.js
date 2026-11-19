const STORAGE_KEY = location.pathname.includes("testplay")
  ? "hina-galgame-testplay-v2"
  : "hina-galgame-act1-v3";
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

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isInteger(saved.chapter)) {
      return {
        ...defaultState(),
        ...saved,
        flags: { ...defaultState().flags, ...(saved.flags || {}) }
      };
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
  sequence = sequence.filter(line => Array.isArray(line) && String(line[1] || "").trim());
  return sequence;
}

function advanceLine() {
  const chapter = chapters[state.chapter];
  if (!chapter) return;
  if (state.phase === "complete") return;

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

function updateScene() {
  const chapter = chapters[state.chapter];
  const scene = document.getElementById("sceneArt");
  scene.className = "scene-art " + (chapter?.id === "A04" ? "corridor" : "office");
  setMood(chapter?.mood || "認真");

  if (state.phase === "choice") setMood("等待選擇");
  if (state.phase === "complete") setMood("目前內容完成");
}

function renderDialogue([kind, text, mood]) {
  const story = document.getElementById("story");
  story.innerHTML = "";
  const p = document.createElement("p");

  if (kind === "hina") {
    p.className = "hina";
    const strong = document.createElement("strong");
    strong.textContent = "空崎陽奈";
    p.append(strong, document.createTextNode(text));
  } else if (kind === "system") {
    p.className = "system";
    p.textContent = text;
  } else {
    p.className = "narration";
    p.textContent = text;
  }
  story.appendChild(p);
  if (kind === "hina") setSpriteEmotion(mood);
  animateSprite(kind, text);
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
      '<p class="narration">已完成第一幕與第二幕。選擇留下的旗標會帶到後續章節。</p>' +
      `<p class="system">rest ${state.flags.rest}｜teamwork ${state.flags.teamwork}｜ordinary_day ${state.flags.ordinary_day}｜daily_checkin ${state.flags.daily_checkin}｜self_rest ${state.flags.self_rest}</p>`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "next";
    button.textContent = "重新開始第一幕";
    button.addEventListener("click", restart);
    box.appendChild(button);
  } else {
    renderDialogue(currentLine());
    const next = document.createElement("button");
    next.type = "button";
    next.className = "next";
    next.textContent = "點一下繼續";
    next.addEventListener("click", advanceLine);
    box.appendChild(next);
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
  state = defaultState();
  render();
  playConfirmSound();
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

document.getElementById("restart").addEventListener("click", restart);
document.getElementById("audioToggle").addEventListener("click", event => {
  musicEnabled = !musicEnabled;
  event.currentTarget.textContent = musicEnabled ? "♫ 音樂開" : "♫ 音樂關";
  if (musicEnabled) startAmbient();
  else stopAmbient();
});

document.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
    if (state.phase !== "choice" && state.phase !== "complete") advanceLine();
  }
});

render();
