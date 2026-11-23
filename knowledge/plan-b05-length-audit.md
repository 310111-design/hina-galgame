# 歷史執行補記：B05 篇幅盤點

> 本檔記錄早期盤點階段的狀態，不是待合併變更單，也不取代唯一總路線圖。當時的 1,454 字／57 tuple 及未完成清單已被後續 BMT 修訂、跨章 QA、經驗合併與部署追蹤取代；請以 `knowledge/plan.md`、`knowledge/experience.md` 及 `knowledge/reviews/full-length-refresh.md` 的目前結果為準。B05 目前為 53 tuple／2,053 字，A／B／C 路徑 1,412／1,424／1,441。

## 已完成且有驗證依據

- [x] 早期版本盤點快照：全分支＝精確去重 1,454 字元／57 tuple；A 1,099、B 1,098、C 1,075 字元，各 41 tuple，無條件對話。不以歷史 2,555 字宣稱達標。現況數據見上方更新與全篇重算紀錄。
- [x] 新增 `scripts/chapter-length-audit.js` 並由固定 routes 執行；唯讀輸出五段、原始／去重總量、單一路徑、條件對話、Unicode 計量差異及節點 SHA-256；新增統計回歸 fixtures，保留既有全部同步及成年篇門檻。
- [x] 固定 game-data／shells／routes 並行通過；既有 `site/testplay.html` 與正式頁各 37 必要 ID、SVG 及 runtime 背景靜態檢查通過。此勾選不是實機試玩驗收。
- [x] 保存盤點證據與適用範圍：`knowledge/reviews/b05-length-audit.md`、`knowledge/experience-b05-length-audit.md`。

## 當時尚未完成的工作（後續狀態另見主路線圖）

- [x] 將盤點結果與經驗合併至主路線圖和主經驗檔；主檔更新後此子文件只保留歷史快照。
- [x] BMT-07 工作狀態已依問題標題釐清：B05 晚間狀態與次日回查橋接已修，B06 收回未結資料；以當前 BMT 審校與主路線圖為準。
- [x] B05 剩餘劇情品質 QA：逐路檢查當晚回報、單一待回查資料與 B06 次日責任；未發現未兌現承諾，未因早期 2,500 字元參考而灌入篇幅。現況與限制記於 `knowledge/plan.md`、`knowledge/reviews/second-act-middle-transitions.md`。
- [x] B05→B06→B07 銜接人工文本審校已完成；見 `knowledge/reviews/second-act-closing-transitions.md` 與 `knowledge/plan.md`。
- [x] 最近推送 `2ab2d9b` 的 Pages workflow 成功、`game.html` 與 `game-data.js` 回應 HTTP 200；這不等同實機試玩驗收。

## 執行限制與順序

角色美術仍依 D-22／23 第一順位但缺影像工具；早期 EAT→PRT→AAT→AMT→AFT→BOT→BMT 修訂仍受 runtime 截斷及安全局部編輯能力阻塞。有安全編輯能力後依主路線圖修復，不單改章稿造成不同步；無此能力則下一批做 B05→B06→B07。

本階段不觸碰 `.env`、原圖、透明草稿或遊戲 runtime。無精確 token 額度，採保守收束：只完成這個完整可驗證階段，保留既有試玩入口，不在收尾展開新一輪大型審校。提交／推送由工具結果確認；文件／測試完成後才呼叫 commit-push，無法在提交前預稱成功。若遠端拒絕非快轉，不 force push，待安全同步工具。
