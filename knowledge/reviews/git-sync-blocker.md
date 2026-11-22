# Git 推送阻塞：分支分歧已安全整合

## 查證與處理結果（2026-11-22）

- `fetch origin` 後，`work/hina-galgame-publish` 位於 `8416ed7`，是當時 `origin/main` `5f95bd7` 的後代（1 ahead、0 behind）。
- `work/hina-galgame-live` 的本地 `main` 位於 `424e37b`，相對同一遠端有 1 筆本地獨有提交、18 筆遠端獨有提交，共同基底 `ebce7d3`。這確認了先前 non-fast-forward 的本地分支分歧。
- 建立 `backup/pre-sync-20261122`；在 `recovery/main-sync-20261122` 以一般 merge 整合兩邊歷史。`knowledge/asset-register.md`、`knowledge/experience.md`、`knowledge/plan.md` 衝突逐檔核對後，採用較新的 `8416ed7` 內容：本地 `424e37b` 的角色圖未去背／未接入判定與更新素材、使用者明確指示及現行遊戲映射不符，不能覆蓋現況。Merge commit：`8de810c`。沒有 force push。
- 另一工作目錄未提交的 `scripts/validate-route-drafts.js` 修改與 `scripts/route-draft-targets.js` 新檔保持原樣，沒有 stage；`.env` 未被追蹤。
- 合併後 `node scripts/validate-game-data.js`、`node scripts/validate-route-drafts.js`、`node scripts/validate-game-shells.js` 全數通過。這不等同 Pages 部署或裝置 QA。
- **下一步：** 將本次狀態文件與經驗補記提交後，以正常 fast-forward push 發布；成功後另查 Actions／Pages，不使用 force push。

## 可複用範圍

適用於共享分支曾被固定 push 工具以 `fetch first` 拒絕、同一 repo 存在多個工作目錄或本地分支落後遠端的情境。先比較提交圖、共同基底與未提交檔案，保存備份，逐項處理衝突；驗證、提交、推送、部署分別記錄證據。
