# Galgame UI 2.0 改版前後畫面基線

日期：2026-11-24

範圍：P01 初始一般對話，在手機直向、手機橫向及桌面 viewport 對照 Galgame UI 2.0 改版前後畫面。

改版前來源：detached worktree commit `9bc642f`；改版後來源：`main` commit `f13f20a`。

瀏覽器：Microsoft Edge 158.0.4370.33（Chromium），透過 DevTools Protocol 固定 CSS viewport，device scale factor 1；擷取前等待立繪 WebP 載入及透明度轉場完成。

## 畫面基線

| viewport | 改版前 | 改版後 |
|---|---|---|
| 390×844 手機直向 | [before-portrait.png](ui2-visual-baseline/before-portrait.png) | [after-portrait.png](ui2-visual-baseline/after-portrait.png) |
| 844×390 手機橫向 | [before-landscape.png](ui2-visual-baseline/before-landscape.png) | [after-landscape.png](ui2-visual-baseline/after-landscape.png) |
| 1440×900 桌面 | [before-desktop.png](ui2-visual-baseline/before-desktop.png) | [after-desktop.png](ui2-visual-baseline/after-desktop.png) |

## 對照觀察

- 三種 viewport 的改版前畫面都將章節、紀錄、存檔、讀檔、重來、全螢幕六個操作直接排在頂部；改版後將主要功能收進「功能」選單，閱讀舞台更集中。
- 手機直向改版前角色較小且靠近底部；改版後角色臉部和上半身更清楚，對話區仍覆蓋立繪下半部。
- 手機橫向改版後保留可辨識的角色表情，對話區與控制按鈕位於畫面內；角色下半部被對話區遮住，和直向版一樣以文字可讀性優先。
- 桌面版改版後也保留大面積場景、角色和底部對話區；頂部操作層級較低，不再與場景競爭。
- 部署驗證：以 cache-buster 取得 Pages `game.css`，與 `git show HEAD:site/game.css` 的 49,768 bytes Git blob 逐位元相同（SHA-256 `fb8c63fa93c9abaff0eed08e3ff71bf2a4d3ffcff96bbb5dc1f1db3a0d746cb8`）。Windows 工作目錄的換行格式不同，因此部署比對以 Git blob 為準。

## 驗收界線

這組截圖只覆蓋 P01 的初始一般對話；沒有檢查選項、長句、大字體、紀錄／存檔面板、動畫與互動，也不是 iPhone Safari 或其他實體裝置驗收。它只完成改版前後的可追溯視覺基線，不代表 UI 2.0 最終 QA 已通過。其餘未完成項目仍依 `knowledge/plan.md` 的 UI 與跨裝置清單處理。
