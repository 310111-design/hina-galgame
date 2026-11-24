# 全篇章節旗標摘要回歸檢查

日期：2026-11-24

## 動機與規則

P03 的節末清單漏列 C 選項實際累加的 `daily_checkin`。跨章檢查也發現入口欄可表示累積狀態，不一定等於當章 conditional intro 讀取的旗標；因此不把入口欄和 `flaggedIntro` 強制判成同一集合。

`scripts/validate-chapter-flag-summaries.js` 對同時有 `旗標入口／旗標摘要` 頁首及 `【節末記錄】` 旗標行的章節，確認結尾旗標等於頁首入口集合、本章 runtime choices 輸出集合與引擎固定章節增量的聯集。A06 每個選項會額外累加 `daily_checkin`，列為該章固定增量。P03 頁首改為「旗標入口」、節末補列 `daily_checkin`，再由同一檢查驗證。

## 範圍與驗證

- 初始掃描中 13／33 章同時具備兩個可比較欄位；另 20 章至少缺其中一欄，由檢查明確計為範圍外，沒有把部分覆蓋宣稱為全章驗收。
- 檢查已接入 `.github/workflows/pages.yml`，並與 `validate-choice-runtime.js` 互補：前者核對章稿 metadata，後者呼叫 runtime 選項函式驗證旗標遞增。
- 本檢查不推導任意歷史選項組合、不判斷對話語義，也不驗證缺欄位章節的記錄；需要更廣覆蓋時，應先為那些章節補上清楚一致的入口和節末格式。
- 本機 `validate-chapter-flag-summaries.js`、`validate-prologue-revisions.js`、`validate-route-drafts.js`、`validate-game-data.js`、`validate-full-length-summary.js`、`validate-choice-runtime.js` 與 `git diff --check` 均通過。commit `152dc7f` 對應 Actions run `45385988705` build／deploy 均成功；Pages 首頁、`game.html`、`game-data.js` 回應 HTTP 200。此提交只新增固定驗證及知識文件，未修改遊戲 runtime 內容。

## 可複用範圍

適用於本作的章節旗標索引與後續擴寫；也適用於多步驟對話系統、互動任務及狀態機文件，將入口條件、每種選項輸出、引擎固定增量與節末狀態聯集交叉核對，並明示無法比較的文件範圍。
