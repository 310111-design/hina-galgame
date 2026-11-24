# 手動與自動存檔分離回歸檢查

日期：2026-11-24  
範圍：六格手動存檔與主線自動存檔 localStorage key 的互不覆寫，以及手動槽位陣列內其他欄位的保存。

## 檢查內容

`scripts/validate-save-separation.js` 使用 runtime 真實 `loadManualSlots()`、`saveManualSlot()`、`saveState()` 函式及記憶體 storage：

- 預置互不相同的主線與手動進度，讀取槽位不寫回。
- 手動保存空欄只更新 `MANUAL_SLOTS_KEY`，保留既有手動欄與原自動存檔。
- 推進後自動保存只更新 `STORAGE_KEY`，不改手動欄位內容，並維持自動存檔 v2 標記。
- 檢查保存結果中的章節、段落、旗標、版本與時間戳欄位。

驗證器已加入 `.github/workflows/pages.yml`。真實瀏覽器重新載入、配額錯誤與 UI 點擊流程仍待 Phase 4 QA；此固定函式檢查不取代裝置驗收。
