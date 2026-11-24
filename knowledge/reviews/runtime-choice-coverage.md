# Runtime 全章節選項回歸覆蓋

日期：2026-11-24  
範圍：33 節共通內容與成年篇結局節點中的 99 個 A／B／C 選項。

## 驗證方式

`scripts/validate-choice-runtime.js` 從 `site/game.js` 擷取實際 `choose()` 與 `getSequence()`，對每節、每個選項建立隔離起始狀態並執行一次，核對：

- 進入 `branch`，line 歸零。
- 只增加選項指定旗標；A06 另增加既有 daily check-in。
- 將選項完整存到當節 choices，且只有設有 `route` 的選項改變路線。
- `getSequence()` 回傳所選字母對應的有效分支台詞。
- 紀錄選項文字並呼叫 render 與確認音效入口。

共 **99 個選項**，固定檢查通過，並已加入 Pages workflow。

## 限制

隔離呼叫不涵蓋多章累積旗標的條件回憶、逐句推進與頁面點選，也不等同玩家完整通關三條路線。`knowledge/plan.md` 的正式逐路 QA 維持未完成。
