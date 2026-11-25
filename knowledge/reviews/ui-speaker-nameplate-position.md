# 對話框姓名標籤位置調整

日期：2026-11-25  
範圍：將陽奈姓名置於 `dialogue-frame.png` 左上方保留框格，文字置中並讓左右留白平衡。

## 實作

- `.story .hina strong` 以對話文字段落為定位容器，將姓名標籤放在 `left: 7.8%`、寬 `31.5%` 的框格；此範圍對應底圖上方左側姓名槽。
- 標籤設為 `box-sizing: border-box`、`justify-content: center`、`text-align: center`，窄螢幕沿用相同比例，不再用固定 28 px 左邊距偏移。
- `scripts/validate-game-shells.js` 檢查定位方式、左右比例與文字置中設定，防止後續 CSS 重排時偏離素材框格。

## 驗證與限制

`node scripts/validate-game-shells.js` 與 `git diff --check` 通過。Computer Use 開啟 Pages 後，服務無法確認該瀏覽器網址是否允許，操作隨即停止；因此本輪沒有桌面、直向手機或橫向手機的渲染截圖，也沒有把視覺／裝置驗收標成完成。下一步仍須檢視 1440×900、390×844、844×390，再安排 iPhone Safari 實機驗收。

## 可複用範圍

本作若以圖片框格承載可互動文字，可用百分比把 HTML 標籤對準素材安全槽，並以 validator 保護定位比例；其他響應式遊戲介面也可採同法。CSS 契約只能保護程式設定，不能代替實際 viewport 截圖或裝置驗收。

## 2026-11-25 對話框文字座標與黑底追查

- **發現：** `.story .hina strong` 原先相對文字段落定位，但段落又受對話框水平 padding、文字自身 padding 與 `max-width` 限制；百分比便不是相對整張框圖。段落定位偏移會令姓名離開素材左上槽。框圖底下另有 `background-color: #0b0912e8` 和 backdrop blur，使透明邊緣看到的是額外黑幕。
- **素材證據：** `dialogue-frame.png` 為 1118×285 RGBA；共 318,630 像素中，6,057 個完全透明、5,011 個半透明、307,562 個不透明。也就是素材雖有透明通道，透明主要在框外；中央閱讀面本身是原圖設計的深色不透明區。沒有修改或挖透明原始素材。
- **修正：** `.dialogue-panel` 成為絕對定位容器並移除額外水平內距、背景色與背景模糊；`.story p` 改用與框寬對齊的響應式左右留白；姓名標籤仍以 7.8%／31.5% 對齊原圖姓名槽，改由整張面板作包含區塊，移除額外膠囊底色。
- **驗收界線：** `validate-game-shells.js`、game-data／route validators、`node --check site/game.js` 及 `git diff --check` 通過。Computer Use 無法確認瀏覽器網址是否允許，因此沒有新的桌面／手機截圖，也未確認畫面字是否壓在邊框上；需把 viewport 目視檢查留在待辦。

### 可複用經驗

有 RGBA alpha 通道不代表圖面每一區都透明。對裝飾面板，先分別統計框外透明、面板內半透明／不透明像素，再檢查 CSS 背景色與 backdrop filter；定位疊在素材上的 HTML 前，須令百分比座標的包含區塊和素材座標同為整張面板。
