# 製作經驗補記：不改劇情資料的章節開始畫面

## 本階段交付

為正式版與試玩版新增共用的章節開始卡：新玩家初次開啟時顯示目前章節代碼與標題；跨章節切換或從章節選單進入新節時顯示章節卡；玩家可按「開始閱讀」、點擊卡片外圍或 Escape 關閉。章卡顯示期間阻止舞台點擊、鍵盤推進與自動播放推進；使用者已有有效存檔時則直接從存檔位置繼續，不以開場卡遮住進度。沒有修改劇情台詞、存檔 schema 或原始美術。

新增：

- `site/chapter-intro.css`：獨立 overlay 樣式，含 safe-area、焦點可見樣式與減少動態效果回退。
- `site/chapter-intro.js`：共用的章節標題、存檔識別、章節變更偵測、互動鎖定及焦點恢復。
- `site/game.html`、`site/testplay.html`：掛載相同章卡元件及 cache-busted assets，章節卡使用 modal dialog ARIA 標記。
- `.github/workflows/pages.yml`：Pages build 增加對 `site/chapter-intro.js` 的 `node --check`，不再只檢查主 `game.js` 語法。

## 固定驗證結果

- `game-data` 通過：33 章、99 選項、99 分支、21 條件組、33 背景映射。
- `routes` 通過： choice sync 2 正向／9 負向、section sync 2 正向／8 負向；33 節相關逐句／路線／篇幅規則通過。該 validator 亦明確保留 AMT／AFT／BOT 等待修提示，並非本輪敘事修復證明。
- `shells` 通過：正式版與試玩版各 37 個必要 JS DOM ID 唯一，sprite 共用來源存在。
- CI 工作流預定以 `node --check site/game.js && node --check site/chapter-intro.js` 驗證兩個腳本；固定工具介面沒有單獨的語法命令，本輪未直接執行 Node／workflow。

## 可複用經驗與適用範圍

1. **閱讀存檔應恢復而非強制重播章卡。** 以既有正式／試玩儲存鍵及 phase 資料檢查是否有有效續讀位置；不把 UI 觀看狀態寫進劇情存檔，避免改 schema 或損害舊存檔。適用於章節標題頁、開場過場與回到遊戲時的續讀體驗。
2. **在資料驅動遊戲中觀察穩定的章節 ID，而非觀察對話行號。** `sceneArt` 的 `data-chapter` 是章節切換訊號；MutationObserver 須比較 `oldValue` 與當前值，否則 render 每次重設同值也會錯誤重播章卡。適用於章節切換動畫、場景載入提示與非侵入式章節過場。
3. **視覺遮罩不會自動阻止事件推進。** 需要一併處理舞台點擊、全域快捷鍵和 autoplay 推進，並給玩家可鍵盤操作的明確關閉按鈕。適用於 modal、教學提示及其他覆蓋在可互動舞台上的 UI。
4. **將新增 UI CSS／JS 拆成小型外掛可降低超長核心檔修改風險。** 對不需要改核心狀態機的 UI 功能，獨立資產再由兩個 shell 共用，比覆寫截斷的大型 `game.css`／`game.js` 更可控。涉及核心狀態轉移時不可只靠外掛假裝完成。
5. **固定 validators 的成功範圍要精確表述。** 本批 `game-data`、`routes`、`shells` 通過，只確認現有資料、路線稿與兩頁必要 DOM ID 完整；不會執行瀏覽器互動、localStorage 恢復、視窗旋轉或 iOS Safari 觸控測試。未來發布仍須完成真機 checklist。

## 範圍、限制與計畫回流

- 本階段只完成 Phase 3「完整章節開始畫面及重要事件的視覺停頓」中的章節開始畫面部分；重要事件停頓、跨裝置驗收尚未完成。
- 三個固定 validators 均通過；未執行瀏覽器、讀屏或真機測試。尤其 mutation 觸發、autoplay 間隔和鍵盤焦點行為仍待人工驗收。
- `knowledge/plan.md` 讀取回傳在檔尾截斷，且檔案介面只有整檔覆寫，沒有安全 patch／append。為避免用不完整內容覆蓋唯一路線圖，本輪不改寫該大檔；Phase 3 對應主 checklist 仍待在可安全 patch 時勾選，**本補記不是主計畫 checkbox 已更新的宣稱**。
- 本補記保留為可回流的經驗來源；合併至 `knowledge/experience.md` 亦待可安全追加／局部 patch 的工具。
- 沒有 Git status、diff、遠端分歧或 Actions 查詢能力；`git_commit_push` 會 stage 所有非忽略變更，無法排除工作區既存使用者變更，故本批沒有呼叫。未宣稱 commit、push 或 Pages 部署成功。
