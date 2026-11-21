# 路線圖完成補記：B05 現況篇幅

> 本檔是 `knowledge/plan.md` 的待合併變更單，不取代唯一總路線圖。主 plan 回傳在主要路徑表末段截斷，主 experience 也截斷，工具沒有 patch／append；為保留未讀歷史，本輪不覆寫兩主檔。

## 已完成且有驗證依據

- [x] 重新盤點 B05 現況正文及 A／B／C 單一路徑篇幅：全分支＝精確去重 1,454 字元／57 tuple；A 1,099、B 1,098、C 1,075 字元，各 41 tuple，無條件對話。不以歷史 2,555 字宣稱達標。
- [x] 新增 `scripts/chapter-length-audit.js` 並由固定 routes 執行；唯讀輸出五段、原始／去重總量、單一路徑、條件對話、Unicode 計量差異及節點 SHA-256；新增統計回歸 fixtures，保留既有全部同步及成年篇門檻。
- [x] 固定 game-data／shells／routes 並行通過；既有 `site/testplay.html` 與正式頁各 37 必要 ID、SVG 及 runtime 背景靜態檢查通過。此勾選不是實機試玩驗收。
- [x] 保存盤點證據與適用範圍：`knowledge/reviews/b05-length-audit.md`、`knowledge/experience-b05-length-audit.md`。

## 尚未完成，不可連帶勾選

- [ ] 安全合併本變更至 `knowledge/plan.md`：只勾 Phase 1 的「重新盤點 B05」；添加新證據連結，下一步移至 B05→B06→B07。
- [ ] 安全追加本經驗至 `knowledge/experience.md`；前七份補記仍待合併，不覆蓋歷史。
- [ ] 對齊 plan／BMT review 的問題索引漂移：review 的 BMT-07 是未修核對橋接，並非 plan 所述已修引號項。合併前以文件路徑＋標題辨識，不誤結案。
- [ ] B05 篇幅補足與敘事品質修訂：先處理今晚核對／回查／明早交接，保留 B 專屬交付，不為參考字数灌水。
- [ ] B05→B06→B07 銜接人工文本審校；本輪未執行。
- [ ] 最新 Actions／Pages 及實機試玩驗收；當前無查詢／瀏覽器工具。

## 執行限制與順序

角色美術仍依 D-22／23 第一順位但缺影像工具；早期 EAT→PRT→AAT→AMT→AFT→BOT→BMT 修訂仍受 runtime 截斷及安全局部編輯能力阻塞。有安全編輯能力後依主路線圖修復，不單改章稿造成不同步；無此能力則下一批做 B05→B06→B07。

本階段不觸碰 `.env`、原圖、透明草稿或遊戲 runtime。無精確 token 額度，採保守收束：只完成這個完整可驗證階段，保留既有試玩入口，不在收尾展開新一輪大型審校。提交／推送由工具結果確認；文件／測試完成後才呼叫 commit-push，無法在提交前預稱成功。若遠端拒絕非快轉，不 force push，待安全同步工具。
