# 條件回憶與章節稿件同步檢查

## 範圍

把 `knowledge/flag-dialogue.md` 中的條件回憶，逐組加入其所屬章節的主稿；並核對章稿、條件索引與 `site/game-data.js` 的旗標、門檻、台詞、說話者及情緒。

## 條件組覆蓋

| 章節 | 條件群組數 | 旗標／門檻 |
|---|---:|---|
| P03 | 3 | `rest >= 1`、`teamwork >= 1`、`ordinary_day >= 1` |
| A02 | 3 | `rest >= 1`、`teamwork >= 1`、`ordinary_day >= 1` |
| B01 | 2 | `daily_checkin >= 1`、`teamwork >= 2` |
| C01 | 2 | `teamwork >= 2`、`self_rest >= 1` |
| D01 | 2 | `self_rest >= 1`、`ordinary_day >= 2` |
| D08F／D08P／D08R | 9 | 三條路線各有 `rest`／`teamwork`／`ordinary_day >= 2` |
| **合計** | **21** | 皆有不同主線章節來源與對應門檻 |

P03 與 A02 已先以來源標記同步。B01、C01、D01、D08F／P／R 本輪補上 `【條件對話：flag >= min】`；各組保留原台詞，沒有改變旗標或 runtime 行為。`route-draft-targets.js` 對這八節使用 `syncConditional`，將條件段落從主正文五段比較中分離，再逐組比對旗標、門檻、台詞和說話者／情緒。

另為 A04／A05／A06 開啟選項 label 比對，補齊早期章節已存在的分段檢查，避免原稿選項與遊戲顯示文字分離。

## 驗證與限制

`validate-route-drafts.js` 通過 A01～A06 的五段／選項檢查，並通過 P03、A02、B01、C01、D01、D08F／P／R 全部 21 組條件稿件同步。`validate-game-data.js` 繼續檢查 `knowledge/flag-dialogue.md` 與 runtime 的 21 組資料及旗標可達性。

這些靜態比較證明來源同步，不代表條件訊息的文意對每一種玩家歷史皆正確；也未窮舉所有玩家選擇序列、瀏覽器路線或實機裝置。條件記憶新增或改稿時，仍需人工核對其主線前提與角色狀態。
