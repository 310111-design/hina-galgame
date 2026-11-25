# Choice 畫面定位、路線提示與對話框透明區

日期：2026-11-25  
觀察來源：GitHub Pages 正式 `game.html`，由 Codex 內建瀏覽器檢視；畫面停在已保存的 P03 選項狀態，約 803×445 橫向 viewport，檢視期間沒有按下選項或改寫遊戲進度。

## 發布版觀察

- 選項頁的章節標題與提示文字擠在舞台頂部；公開 CSS 最後一層把 `.dialogue-panel` 設為 `position: relative`。舞台內其他裝飾及標題採絕對定位，因而使正常流中的面板從舞台頂端開始排列，而非貼齊底部。
- 低高度橫向顯示三張直列選項時，頂部資訊、選項、提示及工具列互相壓縮；choice 狀態仍顯示不可用的「跳過已讀」和一般推進提示。
- 左欄 A／B／C 是展示標記，不是分支資料本身。實際 route 僅在 D06 明確選擇；其他 choices 的 `hint` 表示會留存到後續章節的回憶傾向。
- `dialogue-frame.png` 尺寸為 1118×285，RGBA 中央閱讀面不透明；單純設定 CSS 背景透明不會穿透來源圖的深色像素。這是圖片像素，不是瀏覽器快取或 CSS 多疊一層底色。

## 修正方案

- 對話面板回到 `position: absolute; inset: auto 0 0`，面板仍是姓名牌百分比定位的包含區塊；低高度橫向 choice 面板上限調整為 `min(72dvh, 320px)`，保留 route／memory 提示，choice 狀態隱藏無用的已讀跳過控制，推進提示改為「請選擇一項」。
- 保留 JSON 的 A／B／C 選項識別碼，以免破壞既有存檔；顯示層改成「路線／回憶」徽標。D06 用「路線告知：朋友線／搭檔線／戀愛線」明確說明目的地；一般 choice 用「後續回憶：…」說明效果，不宣稱提前鎖定關係路線。
- 原始 `dialogue-frame.png` 完全保留。新增同畫布的 `dialogue-frame-cutout.png`，以 4× 繪製抗鋸齒圓角遮罩，把中央閱讀區矩形 `(44,43)–(1074,258)` 的來源 alpha 清零，保留原始外框、姓名槽及邊角。原圖 131,959 bytes；衍生圖 80,559 bytes，透明像素由 6,057 增至 223,337。
- `validate-game-shells.js` 解碼 RGBA PNG 抽查中心透明、原圖中心不透明及衍生圖邊框仍可見；也檢查面板 bottom anchor、透明素材路徑與無 CSS fill。`validate-choice-runtime.js` 驗證 route/memory 訊息、三種成年路線文字及沒有可見字母指示。

## 驗證與限制

本機 `node --check site/game.js`、`node scripts/validate-choice-runtime.js`、`node scripts/validate-game-shells.js`、`node scripts/validate-stage-cue-runtime.js` 與 `git diff --check` 通過。這批 UI 改動推送後仍須等 Pages build/deploy 成功，再用 Codex 內建瀏覽器查看一般台詞及 choice 狀態，尤其 844×390 橫向與 390×844 直向的面板、裁切及文字可讀性。透明閱讀面也可能讓背景細節穿過文字；若對比不足，先調整場景暗化／文字陰影而不要恢復不透明黑色填面。

這次檢視不等同真實 iPhone Safari、實體觸控、全鍵盤、輔助科技或多字級矩陣驗收。
