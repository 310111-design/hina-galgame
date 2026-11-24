# 放學後的十分鐘｜陽奈 Galgame 企劃

以空崎陽奈為主角的《蔚藍檔案》非官方同人長篇 Galgame。序章 P01～P03、A01～D07 共 30 節共通互動內容，以及朋友／搭檔／戀愛三個成年篇結局第一稿，均已接入 GitHub Pages 遊戲。UI 2.0、13 種角色表情與 13 張使用者背景素材（12 張映射至章節、一張校園中庭備用）已部署，另有一張生成背景供首頁使用；表情原始 PNG 完整保留，遊戲改用逐像素相同的無損 WebP 副本；全篇審校、事件美術與實機驗收仍在進行，作品尚未完成正式發布。

**企劃展示頁：** [GitHub Pages](https://310111-design.github.io/hina-galgame/)

**遊戲頁：** [開始遊玩](https://310111-design.github.io/hina-galgame/game.html)

**開發更新：** [CHANGELOG.md](CHANGELOG.md)

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
- `CHANGELOG.md`：目前開發狀態與主要更新
- `knowledge/art-prompts.md`：後續透明角色 sprite 的立繪與表情提示詞參考
- `knowledge/device-qa-checklist.md`：iPhone Safari 與桌面瀏覽器人工驗收清單
- `story/chapters/`：逐節 Galgame 正文稿與分支；P01～P03 序章與 A01～D07 共 30 節共通篇，另有 D08F／D08P／D08R 三個路線結局
- `site/`：GitHub Pages 靜態企劃頁與 30 節共通篇＋三路線結局體驗版（`game.html`、`testplay.html`）
- `.github/workflows/pages.yml`：推送至 `main` 時自動部署網站

## 目前美術狀態

- 13 張使用者提供背景均保留原始 JPEG 並有 WebP 版本；12 張已映射至章節，一張校園中庭保留作場景備用。另有一張生成背景供企劃首頁使用。
- 使用者提供的 13 張角色表情 PNG 完整保留；正作以逐像素相同的無損 WebP 副本呈現，較原 PNG 合計小 39.2%，並保留 PNG 與 SVG 載入回退。
- [角色素材預覽頁](https://310111-design.github.io/hina-galgame/character-preview.html) 可查看正作使用的 13 種表情。
- 事件 CG、iPhone Safari／桌面實機、完整路線通關及聲音體驗仍待驗收；部署不代表最終版完成。

## 純文字遊玩時間估算

以 300～400 字元／分鐘計算，單一路線約 2.3～3.1 小時；看完全部分支（跳過重複共通段）約 3.1～4.1 小時；三線完整重讀約 7～9.3 小時。這是按目前 runtime 台詞估算，未經玩家計時，不含操作、演出停留與個人停頓；細節見 [遊玩時間估算](knowledge/reviews/playtime-estimate.md)。

## 自動檢查

GitHub Actions 會檢查 JavaScript 語法、遊戲資料與路線拓撲、正式版／試玩版 HTML 控制元件、圖片尺寸與 alpha 像素，以及三個結局的正文統計與 Markdown 同步。

## GitHub Pages

GitHub Pages 已設為 GitHub Actions 發布來源。workflow 部署 `site/` 目錄；推送至 `main` 後會自動更新網站。

## 聲明

非官方同人企劃，與《蔚藍檔案》官方及其權利人無關。角色與原作相關權利屬各自權利人。此 repo 包含可在瀏覽器遊玩的靜態體驗版，但不代表已完成具完整引擎、正式立繪／配樂與所有路線差分的最終遊戲。
