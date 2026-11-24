# 章節開始卡的說明關聯與焦點回復

日期：2026-11-24

## 發現

正式版與 testplay 的章節卡已用 `role="dialog"`、`aria-modal` 及標題建立 accessible name，但沒有把卡片說明文字綁到 dialog。首次進站沒有存檔時，顯示卡片前焦點位於 `body`；關閉後原程式會嘗試回焦至 `body`，未指定回到可操作的遊戲舞台。

## 修訂

- 為兩頁的 dialog 加上 `aria-describedby="chapterIntroCopy"`，並為說明段落加入對應 ID。
- 關閉卡片時只保留仍連接、可見且未停用的原焦點；若原焦點是 `body`、已隱藏或不可用，則移至 `gameStage`。
- 新增 `scripts/validate-chapter-intro-runtime.js`，並接入 Pages workflow。DOM stub 會執行新玩家開卡、按鍵收卡、body／隱藏元素焦點回退、同章 mutation 不重播、跨章換標題、autoplay 鎖定及正式／試玩存檔續讀；也靜態核對兩頁 dialog 名稱和說明關聯。

## 本地驗證與限制

- `node scripts/validate-chapter-intro-runtime.js` 通過：新遊戲、章卡鍵盤操作、焦點回復、同章不重播、自動推進鎖定及兩種存檔鍵續讀。
- `node --check site/chapter-intro.js`、`node scripts/validate-game-shells.js` 與 `git diff --check` 通過。
- 修正由 commit `cedeb57` 推送，整理腳本尾端空行的 commit `2dad607` 完成最終部署；GitHub Actions run `45381650399` 的 build 與 deploy 均成功。Pages 正式版 `game.html`、`testplay.html` 與 `chapter-intro.js?v=chapter-a11y-20261124` 均 HTTP 200；兩個 HTML 均含 `aria-describedby="chapterIntroCopy"`。
- stub 測試不能呈現真實瀏覽器焦點外觀、iOS Safari 安全區、讀屏器實際公告或 autoplay timer race；這些 UI 實機驗收仍依路線圖待辦辦理。

## 可複用範圍

適用於本作章節卡或其他覆蓋在互動舞台上的 dialog：對話框需同時提供名稱和相關說明；關閉後應回到可見、仍可操作的啟動位置。測試可用隔離的 DOM stub 驗證焦點目標與狀態流程，再另以真實瀏覽器和輔助科技驗收畫面及公告。
