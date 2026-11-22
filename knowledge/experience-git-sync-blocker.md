# 經驗補記：安全整合分歧的本地與遠端 Git 工作

## 可複用經驗

- `fetch first`／non-fast-forward 是遠端歷史保護訊號；先 `fetch`，查清兩邊提交數、共同基底與檔案差異，再決定整合方式。禁止 force push。
- 多工作目錄可能各自有分支和未提交修改。先記錄各工作目錄狀態，建立備份參照；未提交的其他工作要留在原位，不隨手 stage 或 reset。
- Merge 衝突需按檔案比較實際內容與新證據；保留雙方仍有效的工作，若舊狀態已被後續素材或決策推翻，保留 commit ancestry 但採現行事實，並在審校紀錄說明取捨。
- 驗證器通過只證明本地指定檢查，不等同 commit、push 或部署成功。每個狀態分開查證，push 後再確認 Actions／Pages。
- 複合 `git_commit_push` 若在 `git commit` 階段失敗，只能記錄工具回覆的階段；沒有詳細錯誤或 Git 查詢時，不推論工作目錄乾淨、既有提交是否存在，也不能宣稱已嘗試 push。
- 若先前 push 因 `fetch first` 被拒，單純再次呼叫只會在無新變更時可能停在 commit 階段，或再次遇到遠端拒絕；應先取得 status/log/fetch 能力找回提交，不要用空提交、盲目重試或 force push 規避保護。

## 本次適用結果（2026-11-22）

- `work/hina-galgame-publish` 原先在遠端 `5f95bd7` 之上的 `8416ed7`；`work/hina-galgame-live` 的 `main` 為 `424e37b`，fetch 後查得本地獨有 1 筆、遠端獨有 18 筆，共同基底 `ebce7d3`。
- 建立 `backup/pre-sync-20261122`，並以一般 merge 把兩條歷史整合為 `8de810c`。合併涉及素材清冊、路線圖與經驗檔；舊分支美術判定已被更新素材與決策取代，因此保留較新內容並記錄原因。未提交的 route validator 修改留在另一工作目錄，未納入提交；`.env` 未被追蹤。
- 合併後三個固定驗證均通過；一般 fast-forward push 已將遠端 `main` 更新至 `0d9fb9f`。該提交的 Pages workflow 成功，正式網址回應 HTTP 200。另一個 live 工作目錄的本地 `main` 已快轉至 `0d9fb9f`；其未提交 validator 修改仍留在工作目錄，未納入推送。
- 後續第一幕中段審校階段另有一次 push 回覆 `fetch first`；使用者指出未上傳後重跑三個固定 validators 均通過，但再次呼叫複合工具在 `git commit` 階段只回覆一般錯誤。本輪沒有 status/log/fetch 能力，故未確認本地提交與遠端狀態，亦無法宣稱內容上傳或部署。具體恢復紀錄見 `knowledge/reviews/first-act-middle-publish-status.md`。

## 適用範圍

適用於共用 `main` 的多工作目錄、多人或代理協作，以及固定 commit+push 工具曾遇到 non-fast-forward 的專案。先盤點再整合，可避免遺失本地提交、誤提交其他工作或以舊狀態覆蓋新證據。沒有 Git 查詢能力時，誠實保留「已驗證、未能確認上傳」狀態，優於反覆盲推或聲稱已部署。
