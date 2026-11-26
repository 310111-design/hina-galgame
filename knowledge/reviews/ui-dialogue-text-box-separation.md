# 姓名、旁白與正文文字框分離複核

日期：2026-11-26

## 起因與修正

使用者回報，旁白文字看起來仍擠進姓名格，並要求姓名和對話正文分成兩個文字框。前一版雖已有 `#speakerName`、`#story` 兩個 DOM 節點，卻讓姓名欄絕對定位，並只替陽奈台詞顯示姓名；旁白／系統沒有對應標籤，正文則靠可捲動容器上方留白避開姓名位置。這種結構不足以確保視覺上是兩個分開的欄位。

本輪改動：

- 姓名欄標籤依資料類型明確顯示「空崎陽奈」「旁白」「系統」。
- 姓名欄改為正常排版流中的獨立框；正文段落另有獨立邊框及低透明底色，位於姓名框下方。
- 正文區保留自己的捲動範圍，移除以大段頂端 padding 模擬姓名區高度的做法，避免正文捲到固定姓名牌後方。
- 首次公開畫面抽查發現正文框的細邊太淡，因此加強為較明確的金色雙像素邊界與低透明紫底，仍可透出原背景。
- 對照旁白狀態時發現舊版 `game.js` query string 仍被瀏覽器快取，導致姓名欄不載入「旁白」映射；正式頁與試玩頁改用新的 runtime cache-buster，並由 validator 鎖定該版本字串。
- 選項提示與結局狀態維持清除姓名欄，由既有版型顯示。
- 更新 `validate-game-shells.js`，保護姓名標籤映射、姓名框正常流與可見邊框，以及正式頁／試玩頁共用殼層。
- 正式頁與試玩頁 stylesheet cache-buster 同步到 `dialogue-text-boxes-v3-20261126`。

## 驗收狀態

`node scripts/validate-game-shells.js`、`node --check site/game.js` 及 `git diff --check` 均通過。這些靜態檢查確認正式頁／試玩頁欄位、標籤映射、姓名框正常流、正文框樣式及 runtime cache-buster。

commit `f301995` 的 Pages run [45836700352](https://github.com/310111-design/hina-galgame/actions/runs/45836700352) build／deploy 成功。沿用同一個 `testplay.html` A04 隔離存檔，於 803×694 公開畫面看到上框「旁白」、下框「目的地、交付者、可確認的下一步。」；正文框使用可辨識的金邊和低透明紫底，兩欄沒有碰撞。刷新後存檔仍在 A04。這只確認一種桌面 viewport 及一條旁白；陽奈台詞新框樣式、手機 viewport、文字放大、長句捲動、iPhone Safari 與讀屏器仍待驗。

## 限制與後續

目前只修正 UI 呈現，沒有改動故事正文、存檔格式或正式主線存檔。完整跨裝置及讀屏器 QA 仍依 `knowledge/device-qa-checklist.md` 待辦執行。
