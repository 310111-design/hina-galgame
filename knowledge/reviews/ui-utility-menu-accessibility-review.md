# 功能選單按鈕的可存取名稱

日期：2026-11-25  
範圍：正式 `game.html` 與內部 `testplay.html` 的遊戲功能選單。

## 發現與修正

- Codex 內建瀏覽器打開「功能」選單後，輔助功能樹將章節、紀錄／設定、存檔、讀檔及重新開始等可見文字按鈕列為沒有名稱的按鈕節點；畫面上仍可看見按鈕文字。
- 在兩個殼層為「選擇章節」「返回主線」「對話紀錄與設定」「存檔」「讀檔」「從序章重來」加入明確 `aria-label`；全螢幕原有「切換全螢幕」名稱保留。
- `validate-game-shells.js` 現在逐一驗證兩頁的功能選單名稱，避免正式版與 testplay 的互動 shell 不一致。

## 驗證與界線

本機 `node scripts/validate-game-shells.js` 通過：兩個頁殼皆有完整 JavaScript ID、六個具名工具列控制、預期焦點外框對比與 UI 圖片資產。`git diff --check` 通過。實際新版 Pages 輔助功能樹、VoiceOver／NVDA、鍵盤焦點與 iPhone Safari 仍待驗收；本次檢查不代表真實讀屏器已測試。
