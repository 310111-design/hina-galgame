# 減少動態效果下的章節提示可見性

日期：2026-11-24

## 發現與修正

一般 `prefers-reduced-motion` 規則把所有動畫的時長設為 `.01ms !important`。章節提示另有只改變 opacity、不改變空間位置的 `chapterToastReduced` keyframes，原本希望維持 2.4 秒淡入淡出；但後者的 animation shorthand 無法覆蓋全域重要的 `animation-duration`，所以提示幾乎瞬間消失。這與選用 opacity-only reduced-motion 動畫的設計不一致，也讓章節切換提示難以閱讀。

在 `.chapter-toast.is-visible` 的 reduced-motion 規則明確保留 `animation-duration: 2.4s !important`，讓 opacity-only cue 按原定時長顯示；不增加位移效果。

## 回歸檢查與限制

`validate-game-shells.js` 核對最後一條 `.chapter-toast.is-visible` 規則使用 `chapterToastReduced` 並保留 2.4 秒，另檢查專用 keyframes 有 opacity、沒有 transform。commit `521f633` 的 Actions run `45360237584` build／deploy 成功；Pages 首頁、`game.html` 與 `game.css` 均 HTTP 200，已用 cache-buster 確認線上 CSS 含 2.4 秒重要時長覆寫。這是 CSS 原始碼及部署內容檢查，不等於瀏覽器 computed style、實際顯示時間、偏好設定切換、全頁 reduced-motion 視覺檢查或使用者可讀性驗收。

完整鍵盤、輔助科技、動畫感受及 iPhone Safari UI 2.0 QA 仍待完成；不能因固定殼層 validator 通過而勾選完整 UI 驗收。

## 可複用範圍

適用於本作需在 reduced-motion 模式保留的可讀提示；也適用於使用全域 `!important` motion overrides 的 CSS 專案，應檢查元件層級動畫是否需要明確保留時長，以及 reduced-motion keyframes 是否移除 spatial transform。
