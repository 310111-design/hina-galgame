# 音訊設定 runtime 回歸檢查

日期：2026-11-24

## 範圍與情境

`scripts/validate-audio-settings.js` 從正式 `site/game.js` 抽取 `loadAudioSettings()`、`saveAudioSettings()`、`updateAudioControls()` 及音訊總開關、BGM／SFX input handlers；以記憶體 storage 與 mock 控制器執行：

- 預設值與損壞 JSON 回退；已保存的 BGM／SFX 值分別 clamp 到 0～1，並保留關閉狀態。
- BGM slider 更新 active gain 的平滑目標，沒有 active gain 時可依目前 enabled／volume 狀態啟動環境音。
- SFX slider 單獨保存，不改動 BGM 值。
- 音訊總開關更新 enabled 偏好、呼叫 start／stop，並同步 `aria-pressed`、可見標籤及可存取名稱。
- 重建 runtime harness 後重新載入同一 storage，確認音量與 enabled 狀態保留。

## 驗證與限制

`node scripts/validate-audio-settings.js` 通過，並納入 Pages workflow。此檢查只驗證設定值與即時播放 API 呼叫；不建立 AudioContext、不播放或聆聽聲音，也不驗收 iOS 使用者手勢政策、場景淡入淡出、中斷後恢復、控制器畫面或真實聽感。

## 可複用範圍

適用於本作 BGM／SFX 音量、靜音及設定記憶；也適用於 Web Audio app，將設定與事件映射交由 runtime 回歸測試，將實際播放、瀏覽器政策及聽感留給裝置 QA。
