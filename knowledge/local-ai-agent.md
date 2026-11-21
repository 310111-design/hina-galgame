# 本機 AI 專案代理

在 repo 根目錄執行：

```powershell
.\scripts\run-ai-agent.ps1 "開始依 plan.md 執行下一個階段"
```

此啟動器讓 Node 使用 Windows 系統信任的 CA 憑證庫（`--use-system-ca`），維持 TLS 憑證驗證；不要設定 `NODE_TLS_REJECT_UNAUTHORIZED=0`。代理由 `.env` 讀取 `IMAGE_API_BASE_URL`、`IMAGE_API_KEY`、`IMAGE_MODEL`，透過相容 Chat Completions API 呼叫模型。

代理可列檔、讀寫專案 UTF-8 檔案、執行三個固定驗證器（game-data、shells、routes），並在模型判斷階段完成後 stage/commit/push 到 `origin main`。不得讀 `.env` 或 `.git`，沒有任意 shell 工具。每次執行只處理一個階段；請先檢視 `git diff`，再提交/推送。遇到 GitHub 認證提示時依提示登入，不要把 token 貼入對話。
