# 章節重玩狀態隔離回歸檢查

日期：2026-11-24  
範圍：`site/game.js` 章節選單、重玩中選擇、重新開始、自動存檔封鎖及返回主線。此項補強 Phase 4 的自動回歸證據，不代表人工裝置 QA 完成。

## 檢查內容

`scripts/validate-chapter-replay-isolation.js` 從 runtime 抽取實際 `openChapterMenu()`、`choose()`、`restart()`、`saveState()`、`returnToMain()` 及狀態複製函式，以假的 DOM 和記憶體 localStorage 執行完整重玩生命週期：

1. 逐一點選全部 33 個章節選單入口；每節均由 intro 第一行開始，原旗標與 choices 保留，三個結局節點正確套用各自的 route override。
2. 選項修改重玩副本的旗標與選擇，不變更原主線快照。
3. 重玩時開啟其他章節，從原主線快照建立新副本，不承接先前章節重玩的選擇。
4. 重玩中的自動保存不寫入；手動欄位原始值保持不變。
5. 重玩重新開始後仍停留在該章，且保存依然封鎖。
6. 返回主線後逐欄比對原進度、choices、flags、route 及兩種持久化資料。

## 結果與限制

固定驗證通過，並已加入 `.github/workflows/pages.yml`。這能防止這些 runtime 狀態轉換回歸，但假的 DOM 不會驗收實際按鈕點擊、對話框視覺、瀏覽器重載或真實 storage 行為；相關裝置清單仍維持未完成。
