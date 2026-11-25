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
