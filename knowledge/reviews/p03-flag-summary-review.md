# P03 入口條件與選項輸出旗標摘要

日期：2026-11-24

## 發現

P03 頁首列 `rest`、`teamwork`、`ordinary_day`，它們是條件回憶讀取的入口旗標；節末也只重列這三個名稱。但 P03-C 實際另累加 `daily_checkin`，供後續 B01 條件對話讀取。原標籤「旗標摘要」沒有分清輸入與輸出，節末摘要則漏列當章新輸出的旗標。

## 修訂

- 頁首改為「旗標入口」，維持 runtime `flaggedIntro` 使用的三個條件旗標。
- 節末記錄補上 `daily_checkin`，列出入口旗標與當章任一選項可能輸出的旗標聯集。
- `knowledge/chapter-plan.md` 分開描述 P03 入口條件和 A／B／C 輸出：A `ordinary_day`、B `teamwork`、C `daily_checkin`。A06 仍會在每條路徑累加 `daily_checkin`，供 B01 後續回應。
- `validate-chapter-flag-summaries.js` 依 runtime choices 核對 P03 節末是否涵蓋入口／選項旗標聯集，並納入後續具備相同欄位格式的章節。

## 驗證與限制

- `validate-prologue-revisions.js`、`validate-chapter-flag-summaries.js`、`validate-route-drafts.js`、`validate-game-data.js`、`validate-full-length-summary.js` 通過；未更動遊戲 runtime、選項標籤、旗標遞增或遊玩估時。
- `validate-choice-runtime.js` 已覆蓋每個選項寫入其 `choice.flag`，並驗證 A06 每個選項都額外增加 `daily_checkin`；此檢查不驗證所有章節的 Markdown metadata，也不等於完整瀏覽器路線通關。
- commit `aca4d11` 的 Pages Actions run `45384018910` build／deploy 成功；後續全章 validator commit `152dc7f` 的 run `45385988705` build／deploy 也成功，首頁、遊戲頁與 `game-data.js` 均 HTTP 200。本批只修正章稿／章節計畫旗標說明與固定 validator，沒有改動公開 runtime 台詞。
- 新增的入口旗標斷言使用有序值序列化比較；VM 執行的 runtime 物件與測試環境陣列跨 realm，單用原型敏感的深層斷言會在值相同時誤報。

## 全章防漂移範圍

後續追查發現 P03-C 的 `daily_checkin` 會帶入 A01～A05，但五節入口和節末摘要均漏列；舊檢查以入口摘要當基準，無法發現入口、結尾一起漏列。已依前序 runtime 選項和 A06 固定增量推導入口旗標，修正 A01～A05。更新後 27／33 章有入口摘要、14／33 章有節末旗標行可比對；完整範圍與限制見 `knowledge/reviews/full-story-flag-summary-validation.md`。

## 可複用範圍

適用於本作 P03 與後續章節入口／結尾旗標摘要、條件回憶和選項狀態維護；也適用於互動敘事、任務流程與表單狀態，明確分開進入時讀取的條件、每條選擇寫入的結果，以及章末可能存在的狀態聯集。
