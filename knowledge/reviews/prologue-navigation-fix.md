# PRT-07 文件導航修訂

- **範圍：** 僅修正 P01 劇情稿的章節導航與選項標示，不變更遊戲選項、旗標或 runtime。
- **修改：** `story/chapters/P01.md` 頁首由容易與下一章混淆的「下一分支：P02-A/B/C」改為「本章分支：A／休息、B／分擔公務、C／屋頂點心」，另列「下一章：P02『每條路的十分鐘』」。原稿末端看似第二輪選擇的三個項目，改成單一「下一章」導航，不再列出與實際 P02 選項不符的選項。
- **結果：** P01 仍只有其正文內的 A／B／C 一組可玩選擇；稿末不暗示多一輪選擇或分支。P02 選項依舊可自由選擇，不被 P01 字母鎖定。
- **後續完成：** PRT-01～06 已於 `knowledge/reviews/prologue-transitions.md` 同步修訂章稿與 runtime；P01 導航與 P02 實際 choices 保持分層，未增加第二輪遊戲選項。整批修訂狀態與邊界見該審校紀錄。
- **驗證：** 固定 `game-data`、`routes`、`shells` validators 及新建的 `validate-prologue-revisions.js` 均通過。專用 validator 明確核對 P01/P02 導航及 P02 choices label。
- **安全界線：** 大型 `site/game-data.js` 不整檔重寫；只對解析及 canonical JSON 驗證通過的 P01～P03 物件進行唯一序列化區段替換，再原子寫入。沒有改動正式遊戲選項拓撲或旗標規則。
