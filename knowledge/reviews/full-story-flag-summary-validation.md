# 全篇章節旗標摘要回歸檢查

日期：2026-11-24

## 動機與規則

P03 的節末清單漏列 C 選項實際累加的 `daily_checkin`。進一步追蹤累積狀態時，發現 P03-C 的 `daily_checkin` 可一路帶到 A01～A05，但這五章的入口摘要與節末記錄都漏列；舊檢查把入口欄當作基準，因此同一旗標同時缺在入口與結尾時仍會通過。入口集合不是當章 `flaggedIntro` 的同義欄位，而是此前路線選擇可累積的旗標種類。

`scripts/validate-chapter-flag-summaries.js` 依 runtime 的線性章節選項，逐章累積可達旗標種類；入口欄獨立比對此前所有選擇可能帶入的旗標，節末記錄則比對入口旗標、本章 choices 輸出及引擎固定增量的聯集。A06 每個選項都額外累加 `daily_checkin`；D08F／D08P／D08R 是互斥結局，不互相傳遞旗標。修正 A01～A05 的入口和節末摘要，將漏列的 `daily_checkin` 補齊。

## 範圍與驗證

- 更新後檢查 27／33 章的入口摘要、14／33 章的節末旗標記錄；6 章沒有入口欄、19 章沒有節末旗標行，缺少的 metadata 由檢查分別計數，不宣稱已全篇覆蓋。
- 檢查已接入 `.github/workflows/pages.yml`，並與 `validate-choice-runtime.js` 互補：前者核對章稿 metadata，後者呼叫 runtime 選項函式驗證旗標遞增。
- 本檢查驗證旗標種類是否可能大於零，不計算任意歷史的累積次數，不判斷對話語義，也不驗證缺欄位章節；結局之間按互斥節點隔離。需擴大覆蓋時，先補齊缺少的入口或節末欄位。
- 本機 `validate-chapter-flag-summaries.js`、`validate-prologue-revisions.js`、`validate-route-drafts.js`、`validate-game-data.js`、`validate-full-length-summary.js`、`validate-choice-runtime.js` 與 `git diff --check` 均通過。commit `152dc7f` 對應 Actions run `45385988705` build／deploy 均成功；Pages 首頁、`game.html`、`game-data.js` 回應 HTTP 200。此提交只新增固定驗證及知識文件，未修改遊戲 runtime 內容。

## 可複用範圍

適用於本作的章節旗標索引與後續擴寫；也適用於多步驟對話系統、互動任務及狀態機文件，將入口條件、每種選項輸出、引擎固定增量與節末狀態聯集交叉核對，並明示無法比較的文件範圍。
