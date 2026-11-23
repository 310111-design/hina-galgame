# 階段紀錄：C03→C04→C05

> 本檔補充唯一總路線圖 `knowledge/plan.md`。2026-11-24 完成 TMT-01～07 的章稿／runtime 同步修訂與固定驗證；主計畫已合併階段狀態，下一批為 C05→C06→D01。

## 完成項

- [x] 完整閱讀 C03／C04／C05，人工核對兩組交界各九種局部分支組合，記錄 TMT-01～07。這不是十八次瀏覽器通關；證據與逐項修改在 `knowledge/reviews/third-act-middle-transitions.md`。
- [x] 修訂 C04／C05 日序與舊資料責任：C04 為 C03 屋頂談話翌日下午，C05 為再隔日上午；C04 指派待歸檔資料箱的整理者，並為舊表格記錄回查責任、條件與期限，C05 依狀態回收。
- [x] 修訂分支及共通回收：C04 三詞便條只由 C 分支建立；B 分支初步分類不被 common 撤銷，最早舊表格另列待查。C05 的「最後一次」限定為陪同團隊走完新流程的最後一輪共同協助。
- [x] 修訂 C05 場景與文字狀態：B 分支明寫離開巡查隊伍並返室等候，C 分支明寫各組出發；更正否定句解釋，分開回查占用的五分鐘與實際共同休息五分鐘；收工時帶走私人手機，值勤通知依既有輪值交接。
- [x] C04／C05 章稿與 runtime 完全同步；routes 檢查 143／145 tuples，A01～C05 展平合計 2,199 tuples，B01～C05 十三節五段及 39 個選項同步。
- [x] 固定 validators 成功：`validate-route-drafts.js`、`validate-game-data.js`、`validate-game-shells.js`、`node --check site/game.js`、`git diff --check`。沿用既有 fixtures，未新增案例。
- [x] 可重用方法及未來適用範圍追加至 `knowledge/experience.md`；完整經驗詳見 `knowledge/experience-third-act-middle.md`。

## 尚未完成但不阻塞本階段

- [ ] TAT-06 屋頂門／取外套動線依主計畫追蹤；本階段不重複結案。
- [ ] iPhone Safari safe-area、動態視窗、實機觸控與完整多尺寸 QA 尚未完成。
- [ ] C03→C04→C05 局部矩陣不是十八次實機通關；全篇分支 QA 仍未完成。
- [ ] C04／C05 的 Pages 發布狀態待本階段 commit/push 後確認；UI 2.0 commit `fd19721` 已另行部署成功。

## 下一階段

依 `knowledge/plan.md` 接續 C05→C06→D01。使用 `knowledge/reviews/third-act-ending-transitions.md` 與 `knowledge/plan-third-act-ending.md` 已有 CAT-01～06 分析，重點放在既有發現的修稿、同步與驗證，不重做已完成的人工審校；明確區分局部矩陣、靜態檢查、瀏覽器通關與裝置 QA。
