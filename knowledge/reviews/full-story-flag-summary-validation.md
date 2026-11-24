# 全篇章節旗標摘要回歸檢查

日期：2026-11-24

## 動機與規則

P03 的節末清單漏列 C 選項實際累加的 `daily_checkin`。進一步追蹤累積狀態時，發現 P03-C 的 `daily_checkin` 可一路帶到 A01～A05，但這五章的入口摘要與節末記錄都漏列；舊檢查把入口欄當作基準，因此同一旗標同時缺在入口與結尾時仍會通過。入口集合不是當章 `flaggedIntro` 的同義欄位，而是此前路線選擇可累積的旗標種類。

`scripts/validate-chapter-flag-summaries.js` 依 runtime 順序逐章累積可達旗標種類；入口欄獨立比對此前所有選擇可能帶入的旗標，節末記錄則比對入口旗標、本章 choices 輸出及引擎固定增量的聯集。A06 每個選項都額外累加 `daily_checkin`；D08F／D08P／D08R 是互斥結局，不互相傳遞旗標。修正 A01～A05 遺漏的 `daily_checkin`，並為所有 33 章補齊入口與節末欄位。

## 範圍與驗證

- 現在 33／33 章都有入口摘要與節末旗標行；validator 會對任何缺漏直接失敗，並精確比對 runtime 可能帶入與產生的旗標種類。
- 檢查已接入 `.github/workflows/pages.yml`，並與 `validate-choice-runtime.js` 互補：前者核對章稿 metadata，後者呼叫 runtime 選項函式驗證旗標遞增。
- 本檢查驗證旗標種類是否可能大於零，不計算任意歷史的累積次數，也不判斷條件對話的語義。結局之間按互斥節點隔離；稿件 metadata 可達性不代表每種旗標組合都能同時出現。
- 初版 commit `152dc7f` 的 run `45385988705` build／deploy 成功、Pages 三個入口 HTTP 200；文件補記 commit `e458912` 的 run `45386335955` 也成功。全篇修正 commit `b196f21` 的 run `45388052370` build／deploy 成功，Pages 首頁、`game.html`、`game-data.js` 均 HTTP 200；本機 route、game data、篇幅、選項及 metadata 驗證全數通過。本批只改章稿 metadata 與 validator，沒有更動玩家可見 runtime。

## 可複用範圍

適用於本作的章節旗標索引與後續擴寫；也適用於多步驟對話系統、互動任務及狀態機文件，將入口條件、每種選項輸出、引擎固定增量與節末狀態聯集交叉核對，並明示無法比較的文件範圍。
