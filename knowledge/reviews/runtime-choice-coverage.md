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

## 條件回憶 runtime 門檻

同一 validator 以 runtime `getSequence()` 對 21 組條件 intro 各建立兩個隔離狀態：目標旗標低於門檻，以及剛達門檻。逐一比較完整 intro sequence，確認低於門檻不追加該記憶，達門檻時才加入相符台詞；其他旗標歸零以免互相污染。此測試只驗證門檻前後顯示，不窮舉所有可累積歷史。

## 所有章節分支到共通段的 lifecycle

同一 validator 對 33 節的三個選項逐一執行正式 `choose()`，再用正式 `advanceLine()` 從分支末句推進到 common，從 common 末句推進到下一章 intro 或 route ending complete。**99 種選擇路徑**全部檢查 branch/common phase、line 歸零、目的章 ID 與結局完成狀態。

## D06→D07→D08 連續路線整合

`scripts/validate-choice-runtime.js` 另以 runtime 真正的 `choose()` 與 `advanceLine()` 連續執行三個 D06 路線選擇，推進至 D07，對每條路線各選 A／B／C 三種活動，再推進至結局 intro。**九種組合**全部保留 D06 route，並分別進入 `friend → D08F`、`partner → D08P`、`romance → D08R`，且結局節點的 `routeEnding` 與進入狀態一致。此 validator 已由 Pages workflow 執行。

## 限制

隔離呼叫不涵蓋多章累積旗標的所有條件對話組合、逐句打字／閱讀、DOM 點選、存檔重載與玩家完整通關。D06→D07→D08 連續整合只驗證關鍵路線狀態和結局入口，不能代替完整逐路瀏覽器或實機 QA；`knowledge/plan.md` 的正式逐路 QA 維持未完成。
