# 2026-11-24 UI 素材採用與整合紀錄

## 附件範圍

使用者更正第一份 ZIP 是誤傳，本次完全排除，不以其中素材作設計依據。第二份 ZIP 包含：

| 圖片 | 尺寸 | 用途 |
|---|---:|---|
| `選項.PNG` | 1375×768 RGBA | 選項提示框、三列選項框及普通／選取視覺狀態的來源素材。 |
| `對話框.PNG` | 1376×768 RGBA | 對話框的邊框、光澤與底部工具列視覺來源；原圖內已含英文字控制標籤。 |
| `選項說明圖.JPG` | 1376×768 RGB | 對位參考，包含提示區、一般／懸停／選取狀態等中文標記；不放入遊戲。 |

## 採用方式

- 兩張透明 PNG 已複製為 `site/assets/ui/choice-layout-source.png` 和 `dialogue-layout-source.png`，保留未修改的來源。
- 從來源裁切出 `choice-prompt.png`、`choice-row-default.png`、`choice-row-selected.png` 和 `dialogue-frame.png`，讓同一套素材可適應不同面板尺寸。
- `game.css` 將素材用於對話面板、選項提示框及三列選項的未選／焦點／已選狀態；一般文字與選項 label 保持 HTML。
- 對話框原圖烘焙的 LOG／AUTO／SKIP／SAVE／LOAD／CONFIG 文字沒有直接顯示。介面改用具 aria-label 的 HTML toolbar 按鈕，並轉送到現有紀錄、自動播放、已讀跳過、存檔、讀檔與設定功能。
- `選項說明圖.JPG` 只供辨認各素材區域，標註不是新增的產品需求。

## 驗證與限制

`node --check site/game.js`、`node --check site/chapter-intro.js`、Pages workflow 對應的 17 個 validator 與 `git diff --check` 均通過；shell validator 確認正式頁和 testplay 都有六個可存取工具列控制、素材尺寸／透明度及焦點外框對比。更新 44 px 工具列觸控目標後，在本機 testplay 的 1280×720 瀏覽器畫面檢視對話框與完整底部工具列，畫面沒有裁切；Accessibility tree 可辨識紀錄、自動播放、跳過、存檔、讀檔與設定控制，並已確認點擊舞台可繼續對話。

先前保存的手機直向、手機橫向及桌面 viewport 截圖屬於 44 px 調整前的基線；本輪 CUA 預覽沒有提供 viewport override，因此沒有把舊截圖當成更新後手機版通過。commit `85fa915` 的 GitHub Actions／Pages run `45426620863` build、deploy 均成功；公開 `game.html`、`testplay.html`、`game.css` 及 `dialogue-frame.png`、`choice-row-default.png`、`choice-row-selected.png` 均 HTTP 200。公開遊戲畫面可見新對話框底圖，Accessibility tree 列出六項 toolbar 控制。這確認此次版本發布，不等於手機、實際觸控或所有選項 viewport 驗收；iPhone Safari 安全區、動態工具列、長句溢位及讀屏器仍待裝置驗收。

## 可複用範圍

本作後續 UI 面板改版可沿用「來源圖保留、按元件裁切、互動文字保持語意 HTML」的流程；其他遊戲 HUD 或網站也可用相同方式結合使用者提供的裝飾素材與可存取的真實控制。
