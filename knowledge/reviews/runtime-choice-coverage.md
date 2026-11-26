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

## P01→成年結局全路徑整合

2026-11-26 在同一 runtime harness 內，從 P01 `intro` 開始，逐次使用正式 `advanceLine()` 和 `choose()` 完成序章、A／B／C／D01～D06，再依次抵達 D07 與指定結局。朋友、搭檔、戀愛各跑一條 31 節完整路徑，分別以 D07 A／B／C 活動進入 D08F／D08P／D08R；其餘每節採第一個選項作固定測試輸入。

每節都檢查有效 intro／branch／common 文字、狀態階段及預期下一章；執行中核對選擇旗標累積值、條件回憶是否依當下門檻加入、D06 路線保存、每節選擇紀錄數，並確認對應結局進入 `complete`。三條路徑均通過 `node scripts/validate-choice-runtime.js`；commit `f36445a` 的 Pages run 802（[45737982080](https://github.com/310111-design/hina-galgame/actions/runs/45737982080)）亦 build／deploy 成功。

## 限制

三條全路徑仍是作者端 runtime 模擬：每節只選一種固定選項，不涵蓋所有多章旗標歷史、替代分支、逐句打字／閱讀、DOM 點選、存檔重載或玩家盲讀。單章 99 選項生命週期、D06×D07 九組組合及三條全路徑彼此互補，仍不能代替完整逐路瀏覽器或實機通關；`knowledge/plan.md` 的正式逐路 QA 維持未完成。

## 2026-11-27 本機回歸複核

- `node scripts/validate-choice-runtime.js` 通過：21 組條件回憶門檻、99 個選項及章節生命週期、D06×D07 九種 route 組合，以及三條 P01→成年結局 runtime 路徑。
- `node scripts/validate-route-drafts.js` 通過：choice／section sync fixtures、條件對話同步、33 章稿件與 runtime 同步、路徑長度檢查。
- `node --check site/game.js` 通過。
- 以上是作者端靜態／runtime 回歸，不替代瀏覽器互動、替代選項全排列、旗標歷史窮舉、盲讀或實機驗收。

## 2026-11-27 完整路由選項組合擴充

- 擴充 `validate-choice-runtime.js`：將 P01→D06 成年路線→D07 活動→D08 結局，從每條 route 的一條代表路徑擴為全組合驗收。
- 共執行 **27 條隔離 runtime 路徑**：3 種 D06 路線 × 3 種 D07 活動 × 各 D08 結局的 3 種回應。每條路徑核對章節順序、實際選項、累積旗標、21 組條件回憶門檻的顯示狀態及正確結局完成狀態。
- `node scripts/validate-choice-runtime.js`、`node --check scripts/validate-choice-runtime.js` 與 `git diff --check` 通過。
- 這些仍是固定輸入的作者端 runtime 模擬，不能取代玩家在瀏覽器逐句閱讀、讀屏器或真機操作。
