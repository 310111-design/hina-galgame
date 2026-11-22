/* Adds a brief, dismissible chapter title card without changing save data or story content. */
(() => {
  const stage = document.getElementById("gameStage");
  const scene = document.getElementById("sceneArt");
  const overlay = document.getElementById("chapterIntro");
  const startButton = document.getElementById("chapterIntroStart");
  const titleNode = document.getElementById("chapterIntroTitle");
  const codeNode = document.getElementById("chapterIntroCode");
  if (!stage || !scene || !overlay || !startButton || !titleNode || !codeNode) return;

  const testplay = location.pathname.includes("testplay");
  const saveKey = testplay ? "hina-galgame-testplay-v3" : "hina-galgame-full-v4";
  const legacyKey = testplay ? "hina-galgame-testplay-v2" : "hina-galgame-act1-v3";
  const hasUsableSave = () => {
    try {
      const raw = localStorage.getItem(saveKey) || localStorage.getItem(legacyKey);
      if (!raw) return false;
      const save = JSON.parse(raw);
      return Number.isInteger(save?.chapter) && save.chapter >= 0 &&
        ["intro", "choice", "branch", "common", "complete"].includes(save.phase);
    } catch (_) {
      return false;
    }
  };

  let isOpen = false;
  let returnFocus = null;

  const showCard = () => {
    const chapterName = document.getElementById("chapterLabel")?.textContent?.trim() || "";
    const chapter = (window.HINA_GAME_DATA || []).find(item => item.id === chapterName);
    const toast = document.getElementById("chapterToast")?.textContent?.trim() || "";
    const [toastCode, ...toastTitle] = toast.split("｜");
    codeNode.textContent = toastCode || chapterName;
    titleNode.textContent = toastTitle.join("｜") || chapter?.title || "放學後的十分鐘";
    overlay.hidden = false;
    overlay.classList.remove("is-leaving");
    isOpen = true;
    returnFocus = document.activeElement;
    startButton.focus({ preventScroll: true });
  };

  const closeCard = () => {
    if (!isOpen) return;
    overlay.classList.add("is-leaving");
    isOpen = false;
    window.setTimeout(() => {
      if (isOpen) return;
      overlay.hidden = true;
      overlay.classList.remove("is-leaving");
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      else stage.focus({ preventScroll: true });
    }, 300);
  };

  startButton.addEventListener("click", closeCard);
  overlay.addEventListener("click", event => {
    event.stopPropagation();
    if (event.target === overlay) closeCard();
  });
  document.addEventListener("keydown", event => {
    if (!isOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeCard();
    } else if (event.key === "Tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      startButton.focus({ preventScroll: true });
    } else if (event.target === startButton && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeCard();
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener("click", event => {
    if (isOpen && !overlay.contains(event.target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Prevent automatic playback from moving the story behind the visible card.
  if (typeof window.advanceLine === "function") {
    const advance = window.advanceLine;
    window.advanceLine = function (...args) {
      if (isOpen) return;
      return advance.apply(this, args);
    };
  }

  const observer = new MutationObserver(records => {
    const chapterChanged = records.some(record => record.oldValue !== scene.dataset.chapter);
    if (chapterChanged) showCard();
  });
  observer.observe(scene, { attributes: true, attributeFilter: ["data-chapter"], attributeOldValue: true });

  // New players get an opening card; a saved mid-chapter session resumes in place.
  if (!hasUsableSave()) showCard();
})();
