# 明確逐句舞台特寫／退遠 cue

日期：2026-11-25  
範圍：為劇本加入 opt-in 的角色立繪縮放 cue；沒有修改現有故事台詞，也未替任何章節新增 cue。

## 實作

- Markdown 使用 `【陽奈｜情緒｜特寫】台詞` 或 `【陽奈｜情緒｜退遠】台詞`。資料解析器將它們同步為可選第四 tuple 欄位 `close`／`wide`；原先三欄 tuple 保持中性。
- `game.js` 僅讀明確 cue 欄位；close=1.045、wide=0.97，更新下一句、旁白、選項、結局或章節時會回到標準比例。未知 cue 在 runtime 清空，並由資料 validator 阻止進入內容。
- `prefers-reduced-motion: reduce` 會停用 cue 縮放。立繪比例以 CSS 個別 `scale` 變數和既有 sprite alpha 尺寸校準相乘，不改來源圖或底部錨點。
- 事件 CG 的專屬轉場未納入此欄位；待 CG 素材及章節映射建立後另訂規格。

## 驗證與限制

`validate-game-data.js` 加入有效／無效 schema fixtures；`validate-route-drafts.js` 測試 Markdown cue 轉 tuple；`validate-stage-cue-runtime.js` 以小型 DOM stub 驗證 close、wide、無效值、一句後重設、減少動態規則及現有故事全部保持三欄中性；新 validator 已接入 Pages workflow。這些靜態和 harness 檢查不證明實際 viewport 表演品質、角色是否被裁切或 iPhone Safari 動態效果。

## 可複用範圍

本作後續角色演出只在劇本明示時使用縮放 cue；其他視覺小說的說話者／鏡頭 metadata 也可沿用「可選欄位、預設無效果、parser 雙向同步、無效值拒絕、減少動態回退」做法。敘事標記必須和表情欄位分離，避免單靠情緒名稱決定鏡頭。
