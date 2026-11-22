# AMT-01～08 修訂階段：runtime 安全編輯阻塞紀錄

## 本輪確認

- 優先工作仍是 `knowledge/plan.md` 的 AMT-01～08 修訂。已讀取 A03／A04／A05 劇情稿、AMT 審校矩陣及目前 `site/game-data.js` 回傳內容。
- `site/game-data.js` 的讀取回傳在 A03 common 中途截斷，不能作為完整 runtime 資料來源。可用檔案工具只有 UTF-8 整檔讀取／整檔寫入；沒有可呼叫的本機程式執行、結構化 parser／selector、暫存檔原子替換或 patch／append 操作。固定 validators 是唯讀驗證器，不能安全地當成資料編輯器。
- 因此本輪沒有修改章稿或 runtime，避免產生正文與遊戲版本不一致，也沒有以截斷前綴覆寫 runtime。`.env`、原始 art 與其他素材未動。
- 固定 `routes`、`game-data`、`shells` validators 本輪重新執行均通過。這只表示現有同步／資料／頁面結構檢查通過；不表示 AMT 敘事問題已修復，也不替代章稿和 runtime 的同步修改。

## 環境與 Git 能力界線

- 本工具介面無法提供目前工作目錄的絕對路徑、Git 分支、`git status`、diff、遠端 main 或 Actions 狀態；根目錄 `list_files` 亦回覆 `Outside project`。因此無法依本輪工具證據重新確認工作目錄／分支／既有未提交變更。
- 有一個複合 `git_commit_push` 工具，描述為「stage all nonignored project changes、commit、push main」，但它不提供先查 status／diff 或選擇性 stage 的步驟；在未確認工作樹且要求保留既有變更時，本輪不呼叫它，以免把使用者既有變更一併提交。故本輪沒有 commit／push，也不宣稱已查詢 GitHub 或推送成功。
- 本次可以透過目前對話使用語言模型；不代表有本機 shell、Git 查詢、GitHub API／Actions 查詢、互動瀏覽器或圖像編輯能力。未直接驗證後幾項能力。

## 安全恢復建議

只有提供以下任一安全能力後，才進行 AMT 同步修訂：

1. 本機程式執行工具：完整解析 `site/game-data.js`，依唯一章節 ID A03、A04、A05 定位，驗證各節唯一且原結構完整，再只改目標節的指定 intro／branch／common；寫入同目錄暫存檔，重新完整 parse 並核對非目標章節不變後，以原子 rename 替換。
2. 可分段讀取並支援精確 patch 的檔案介面，同時能在寫入後完整讀回驗證；不能以截斷內容整檔覆寫 runtime。

恢復後依 AMT 基準同步修改三節 Markdown/runtime，執行 `routes`、`game-data`、`shells`；檢查 diff 與 Git 狀態，確認只包含本階段及先前明確保留的變更後再提交推送。沿用 AMT 審校建議：A03→A04 明示隔日及清單更新；A04 的資料交接、清單所有權和場景行動鏈要閉環；A05 各分支的時鐘／巡邏結果不外溢到 common，並修正重複熄燈及未建立的昨日欠休假設。