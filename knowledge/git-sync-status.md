# Git 本地／遠端分歧處理紀錄

## 查證結果（2026-11-22）

- 工作目錄 `work/hina-galgame-publish` 原先位於 detached HEAD `8416ed7`，其父提交是 `origin/main` 的 `5f95bd7`；該工作目錄本身比當時遠端多 1 筆、落後 0 筆。
- 另一工作目錄 `work/hina-galgame-live` 的本地 `main` 為 `424e37b`，與 fetch 後 `origin/main` 分歧：本地獨有 1 筆、遠端獨有 18 筆，共同基底為 `ebce7d3`。該工作目錄有未提交的 `scripts/validate-route-drafts.js` 修改及 `scripts/route-draft-targets.js` 新檔，本輪未修改、未提交這些檔案。
- 在發布工作目錄建立 `backup/pre-sync-20261122` 備份及 `recovery/main-sync-20261122` 整合分支，以一般 merge 合併 `main`。`424e37b` 的美術狀態文件與較新的 `8416ed7` 及本作現行素材證據相矛盾；逐檔檢查後保留較新的現行版本，沒有用舊文件覆蓋角色素材狀態。整合提交為 `8de810c`，雙方提交沿革皆保留；沒有 force push。
- `.env` 未列入 Git 追蹤。`git fetch origin` 成功；本地 recovery 分支相對 fetch 時的 `origin/main` 為 3 筆 ahead、0 筆 behind。
- 合併後 `game-data`、`routes`、`shells` 固定驗證均成功。這些只證明本地資料與同步檢查通過，不代表 Pages 已部署或實機驗收。

## 下一步及安全界線

先提交本次核對紀錄及已解決狀態，再以一般 fast-forward `git push origin recovery/main-sync-20261122:main` 更新遠端。若 push 前出現新的拒絕，重新 fetch 並比較，不 force push。推送成功後再檢查 Actions／Pages；沒有可查證的部署結果時不宣稱部署完成。

適用於多工作目錄／多代理共用 Git 分支：先 fetch、比較共同基底及雙方獨有提交，保留乾淨備份，檢視衝突內容，再 merge；舊分支若包含被較新證據推翻的狀態，須保留歷史而採用現行事實，不能只為消衝突盲目接受舊內容。
