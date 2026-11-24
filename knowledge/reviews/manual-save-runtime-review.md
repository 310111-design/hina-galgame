# 六格手動存檔 runtime 回歸檢查

日期：2026-11-24

## 範圍

以記憶體 `localStorage` 建立 harness，直接抽取正式 `site/game.js` 的 `loadManualSlots()`、`saveManualSlot()`、`loadManualSlot()` 及格式驗證函式。不同於手動存檔 migration validator，本檢查覆蓋正常操作與錯誤欄位讀取的狀態結果。

## 覆蓋情境

- 對六個空欄各保存一次，確認容器固定六格、各自保存當前進度。
- 對第三欄嘗試覆寫並取消，確認詢問欄位號正確、原資料不變且存檔視窗不關閉；再確認覆寫，只更新所選欄位。
- 讀取有效欄位，確認章節／分支旗標恢復、主線載入解除自動存檔阻擋、結束章節重玩並清除舊回放快照與對話紀錄。
- 讀取空欄或不支援版本欄位，確認顯示錯誤、不覆蓋目前進度且不關閉視窗；不支援資料及原容器維持不變並暫停寫入。

## 驗證與限制

`node scripts/validate-manual-save-runtime.js` 以現行 runtime 函式及 mock DOM／memory storage 執行以上情境。CI 工作流程同時保留 migration／損壞保護與自動存檔測試。

commit `1210f1a` 的 Actions run `45358027721` build 與 deploy 均成功；Pages 首頁、`game.html`、`game.js` 回應 HTTP 200。此為 CI／部署與 runtime 狀態驗證，不代表手動存檔 UI 實機操作完成。

本檢查不覆蓋真實 `<dialog>`、六欄視覺摘要、按鈕 disabled 狀態、焦點、Escape、瀏覽器 reload、localStorage 配額或裝置縮放；不能將它描述成手動存檔 UI 完整驗收。

## 可複用範圍

適用於本作新增存檔、覆寫確認、讀檔及重玩狀態還原；也適用於 Web app 以多欄位保存使用者資料時，利用正式 runtime 函式與隔離 storage 驗證取消／確認及損壞輸入不會破壞既有狀態。
