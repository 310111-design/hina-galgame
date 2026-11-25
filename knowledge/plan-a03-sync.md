# 路線圖階段變更單：A03 分段與選項同步

> 歷史階段紀錄：A03 分段／選項同步已整合至 `knowledge/plan.md`；後續 AAT／AMT 修訂也已完成並各有 review。以下未勾選方框記錄當時的交付界線，不是目前 TODO；目前狀態以 `knowledge/plan.md` 為準。靜態同步仍不代表語義或實機 QA 完成。

## 已交付

- [x] A03 由展平正文同步擴充為 intro／A／B／C／common 五段邊界同步；同時檢查選項字母、順序與 label。設定沿用 `scripts/validate-route-drafts.js` 已測試的 parser 與回歸 fixtures。
- [x] 固定 `routes`、`game-data`、`shells` validators 全部通過。A03 共 107 個 dialogue tuples 同步；無正文或 runtime 變更。
- [x] 可複用方法與適用範圍保存於 `knowledge/experience-a03-section-sync.md`；這是補記交付，主經驗檔仍待安全合併。

## 不可由本交付推論完成

- [ ] A03 人工審校發現及 AMT-01／AAT 舊問題已修復（本批沒有改稿）。
- [ ] A01／A02 分段邊界已同步（本批只涵蓋 A03）。
- [ ] 全篇分支 QA、瀏覽器／裝置驗收或 Pages 部署完成。
- [ ] `knowledge/plan.md`／`knowledge/experience.md` 主檔合併（目前無安全局部編輯能力）。

`.env`、原始美術、角色素材、章稿、runtime 與既有存檔結構未修改。
