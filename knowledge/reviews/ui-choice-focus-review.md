# UI 2.0 選項確認後的焦點回復

日期：2026-11-24

## 發現

選項按鈕在確認後會由 `render()` 移除並換成分支台詞；鍵盤焦點原先可能仍指向已離開 DOM 的按鈕，或回到文件本文，令接續閱讀失去明確位置。

## 修訂

`choose()` 重繪分支後，將焦點移至 `tabindex="-1"` 且有「遊戲畫面」標籤的 `gameStage`，並使用 `preventScroll` 避免不必要的版面跳動。既有 Enter／空白鍵推進處理可在此焦點狀態下繼續運作。`validate-game-shells.js` 固定檢查此回復。

## 驗證與限制

JavaScript 語法、game shell、遊戲資料、路線稿件與 `git diff --check` 通過。首次 Actions 執行發現章節重玩 harness 的 DOM 假物件缺少 `.focus()`；已新增 focus stub，並在 `validate-chapter-replay-isolation.js` 斷言分支選擇後舞台收到焦點。這些檢查不能代替瀏覽器中的實際鍵盤焦點可見性、VoiceOver／NVDA 朗讀或逐路實機 QA。

## 可複用範圍

選項確認會刪除原按鈕時，將焦點送至能繼續目前任務的內容區或下一個可操作控制項。適用於本作分支選項、互動故事與任何會動態替換控制項的 Web 介面。
