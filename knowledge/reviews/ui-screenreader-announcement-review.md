# 打字機動畫的螢幕閱讀器公告複核

日期：2026-11-24

## 問題

正式遊戲與 testplay 的 `#story` 原本使用 `aria-live="polite"`，而 runtime 以數十毫秒間隔逐字寫入同一節點。即時朗讀區因此會收到一連串半句更新，不一定能將視覺打字機效果轉成清楚、可控制的朗讀。

## 修訂

- 可見 `#story` 不再是 live region，逐字動畫與視覺樣式保持不變。
- 新增隱藏的 `#storyAnnouncement` 原子 polite live region，完整台詞只在打字完成或玩家點擊補完後公告，並標示陽奈、旁白或系統來源。
- 已讀快進期間抑制中間台詞公告；若停在選擇畫面或路線結局，改公告選擇提示或結局標題與摘要。
- `validate-game-shells.js` 檢查正式頁與 testplay 都保有獨立公告區，並檢查打字完成、點擊補完與已讀快進的公告控制。

## 驗證與限制

`node --check site/game.js`、`validate-game-shells.js`、`validate-game-data.js`、`validate-route-drafts.js` 與 `git diff --check` 通過。驗證僅涵蓋程式語法、殼層結構及既有路線／稿件資料；未使用 NVDA、VoiceOver 或其他螢幕閱讀器實際聆聽，也不代表鍵盤焦點、瀏覽器逐路或裝置 QA 完成。

commit `c0289ba` 的 Actions run `45347508333` build／deploy 成功；Pages 首頁、`game.html`、`testplay.html` 與 `game.js` 均 HTTP 200。線上正式頁與 testplay 都有原子 polite 公告區，正式頁可見劇情區不再是 live region，線上 runtime 在完整句子完成時公告。此為部署結構確認，不是實際螢幕閱讀器聆聽驗收。

## 可複用範圍

介面採打字、逐字字幕或快速變更文字時，讓可見動畫照常更新，另以完整句子更新原子 live region；略過內容時抑制中間播報，停在選擇或結果時公布目前狀態。適用於本作遊戲及 testplay、聊天介面、互動小說與即時狀態面板，減少重複及不完整語音資訊。
