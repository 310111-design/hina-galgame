# P01～P03 全文與條件台詞同步驗證（2026-11-24）

## 發現

- P01 有一句旁白在 runtime 中切成兩個 dialogue tuple，稿件卻把它併成一句；P01 稿件的選項外層引號也不是 runtime 顯示內容。
- P02 的正文已逐句符合 runtime，但固定 validator 沒有覆蓋全文。
- P03 的三組條件台詞以自然語言說明旗標前提，無法由 routes validator 分離正文與條件回憶；專用 prologue validator 先前只核對 15 組重點文字及 P02 choices。

## 修訂

- 將 P01 旁白拆回兩句，選項 label 改為遊戲實際顯示的文字。
- P03 改用 `【條件對話：rest >= 1】`、`【條件對話：teamwork >= 1】`、`【條件對話：ordinary_day >= 1】` 明示條件；對白仍留在可讀正文中。
- `route-draft-targets.js` 新增 P01～P03 全文同步目標；routes validator 將條件區段從主線台詞解析中分離，再比對 `flaggedIntro` 的旗標、門檻及對話 tuple；三節選項 label 也納入核對。
- 新增 choice block 標頭與條件台詞區段的記憶體 regression fixtures，涵蓋錯誤選項、錯誤門檻及條件台詞誤入主線對照。

## 驗證與限制

`node scripts/validate-route-drafts.js` 通過；P01／P02／P03 分別核對 86／47／24 條主線 dialogue tuple，三節 A／B／C 選項 label 與 P03 三組條件對話均同步。新的 route/prologue choice fixtures、conditional dialogue fixtures 均通過；`validate-prologue-revisions.js` 原有檢查仍保留。

這是稿件、runtime 及條件資料的靜態同步驗證，不會自動走完序章所有選項，也不代表逐字演出、背景或裝置 QA 已完成。
