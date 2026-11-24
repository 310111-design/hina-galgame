# 環境音轉場 runtime 回歸檢查

日期：2026-11-24

## 範圍與情境

`scripts/validate-audio-transitions.js` 從正式 `site/game.js` 抽取 `ensureAudio()`、`createAmbient()`、`startAmbient()`、`transitionAmbient()` 與 `stopAmbient()`，以 mock `AudioContext`、gain／oscillator 節點與可手動觸發的計時器驗證：

- 首次播放會嘗試從 suspended 狀態 resume，建立目前場景的音符及 master gain 淡入；重複開始不建立重複節點。
- 切至目前場景不重建；切換場景時舊 master gain 淡出，新場景按設定淡入並排定舊 oscillator 停止及節點清理。
- 快速連續切換 office→corridor→rooftop 時，兩組 timeout 分別清理對應舊節點，不會斷開 corridor 的最新節點或 rooftop 的目前節點。
- AudioContext 再次 suspended 後重新要求播放會再次呼叫 resume；停止環境音會淡出、排定 oscillator 停止與延遲斷線，停用狀態不重啟播放。

## 驗證與限制

本機 `node scripts/validate-audio-transitions.js` 與 Pages workflow 全套檢查通過。commit `8921050` 的 GitHub Actions run `45359545666` build／deploy 成功；正式 Pages 首頁、`game.html` 與 `game.js` 均回應 HTTP 200。這只驗證正式 runtime 函式發出的 Web Audio API 呼叫及 mock 節點生命週期；mock 不等待實際計時、不生成或聆聽音訊，也不證明 Safari／iOS 自動播放政策、瀏覽器 AudioParam 實作、作業系統中斷後恢復、實際控制器畫面或淡入淡出聽感。

## 可複用範圍

適用於本作環境音場景切換、靜音及恢復；也適用於 Web Audio 場景音樂、濾鏡或其他以 timeout 延遲清理節點的功能。快速轉場測試應保存每一批舊節點的獨立參考，逐批斷言清理範圍，避免只檢查最新狀態而漏掉 race。
