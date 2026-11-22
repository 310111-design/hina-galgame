# Git 本地／遠端分歧處理紀錄

## 查證結果（2026-11-22）

- 工作目錄 `work/hina-galgame-publish` 原先位於 detached HEAD `8416ed7`，其父提交是 `origin/main` 的 `5f95bd7`；該工作目錄本身比當時遠端多 1 筆、落後 0 筆。
- 另一工作目錄 `work/hina-galgame-live` 的本地 `main` 為 `424e37b`，與 fetch 後 `origin/main` 分歧：本地獨有 1 筆、遠端獨有 18 筆，共同基底為 `ebce7d3`。該工作目錄有未提交的 `scripts/validate-route-drafts.js` 修改及 `scripts/route-draft-targets.js` 新檔，本輪未修改、未提交這些檔案。
- 在發布工作目錄建立 `backup/pre-sync-20261122` 備份及 `recovery/main-sync-20261122` 整合分支，以一般 merge 合併 `main`。`424e37b` 的美術狀態文件與較新的 `8416ed7` 及本作現行素材證據相矛盾；逐檔檢查後保留較新的現行版本，沒有用舊文件覆蓋角色素材狀態。整合提交為 `8de810c`，雙方提交沿革皆保留；沒有 force push。
- `.env` 未列入 Git 追蹤。`git fetch origin` 成功；本地 recovery 分支相對 fetch 時的 `origin/main` 為 3 筆 ahead、0 筆 behind。
- 合併後 `game-data`、`routes`、`shells` 固定驗證均成功。這些只證明本地資料與同步檢查通過，不代表 Pages 已部署或實機驗收。

## 推送與部署結果

- 以一般 fast-forward `git push origin recovery/main-sync-20261122:main` 推送成功：遠端 `main` 從 `5f95bd7` 更新至 `0d9fb9f`。
- 該 commit 的 GitHub Actions Pages workflow 狀態為 `completed / success`；正式網址 `https://310111-design.github.io/hina-galgame/` 回應 HTTP 200。Pages REST 設定端點回覆 404，因此以 workflow 與正式網址作部署證據。
- `work/hina-galgame-live` 本地 `main` 已 `--ff-only` 快轉至 `0d9fb9f`，當時與 `origin/main` 一致；既有未提交的 route validator 修改和新檔仍保留，未納入本次提交。
- 沒有 force push。後續若再遇拒絕，重新 fetch 並比較提交圖與工作目錄，不以覆蓋遠端處理。

適用於多工作目錄／多代理共用 Git 分支：先 fetch、比較共同基底及雙方獨有提交，保留乾淨備份，檢視衝突內容，再 merge；舊分支若包含被較新證據推翻的狀態，須保留歷史而採用現行事實，不能只為消衝突盲目接受舊內容。
