# 放學後的十分鐘｜陽奈 Galgame 企劃

以空崎陽奈為主角的《蔚藍檔案》二創長篇 Galgame 企劃，基調為甜甜的日常與酸甜青春。目前已完成序章 P01～P03 與 A01～D07 共 30 節共通互動內容，並接入朋友／搭檔／戀愛三個成年篇結局第一稿；作品仍持續進行連貫性審校與正式視覺素材製作。

**企劃展示頁：** [GitHub Pages](https://310111-design.github.io/hina-galgame/)

**角色素材預覽：** [正作使用的 13 種表情](https://310111-design.github.io/hina-galgame/character-preview.html)

## 專案內容

- `knowledge/plan.md`：願景、規格與路線圖
- `knowledge/story-bible.md`：故事聖經工作稿
- `knowledge/story-outline.md`：四幕故事架構
- `knowledge/chapter-plan.md`：章節卡與分支工作表
- `knowledge/experience.md`：可複用製作經驗
- `knowledge/flag-dialogue.md`：跨章節旗標條件對話文字來源
- `knowledge/decision.md`：待決事項與推薦方案
- `knowledge/asset-register.md`：視覺素材清冊
- `knowledge/art-prompts.md`：後續透明角色 sprite 的立繪與表情提示詞參考
- `knowledge/device-qa-checklist.md`：iPhone Safari 與桌面瀏覽器人工驗收清單
- `story/chapters/`：逐節 Galgame 正文稿與分支；P01～P03 序章與 A01～D07 共 30 節共通篇，另有 D08F／D08P／D08R 三個路線結局
- `site/`：GitHub Pages 靜態企劃頁與 30 節共通篇＋三路線結局體驗版（`game.html`、`testplay.html`）
- `.github/workflows/pages.yml`：推送至 `main` 時自動部署網站

## 目前美術狀態

- 13 張背景已完成章節映射，並提供 WebP runtime 版本；原始 JPEG 保留。
- 13 張使用者提供的角色表情 PNG 已接入正作，包含替換原有 8 種及新增 5 種；原有素材仍保留。
- [角色素材預覽頁](https://310111-design.github.io/hina-galgame/character-preview.html) 可查看正作使用的 13 種表情。

## 自動檢查

GitHub Actions 會檢查 JavaScript 語法、遊戲資料與路線拓撲、正式版／試玩版 HTML 控制元件、圖片尺寸與 alpha 像素，以及三個結局的正文統計與 Markdown 同步。

## GitHub Pages

GitHub Pages 已設為 GitHub Actions 發布來源。workflow 部署 `site/` 目錄；推送至 `main` 後會自動更新網站。

## 聲明

非官方同人企劃，與《蔚藍檔案》官方及其權利人無關。角色與原作相關權利屬各自權利人。此 repo 包含可在瀏覽器遊玩的靜態體驗版，但不代表已完成具完整引擎、正式立繪／配樂與所有路線差分的最終遊戲。
