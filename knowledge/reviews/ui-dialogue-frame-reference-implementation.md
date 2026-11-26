# 2026-11-26 對話框參考樣式接入

## 需求解讀

採用使用者附圖的深紫黑金屬框、左上姓名牌、本文留白、底部分隔線、右側推進箭頭及底部控制列。畫面內「新增少量內文文字」是示意佔位，只作版面參考，不加入故事本文或 runtime 對話。控制列保留可操作 DOM，不把烘焙按鈕文字當成真正的互動控制。

## 實作

- `dialogue-layout-source.png` 原檔維持不變；從 alpha 範圍裁成 1112×387 `dialogue-frame-runtime.png`，清理區只覆蓋原圖內嵌的工具列文字／圖示，保留邊框、姓名槽、分隔線、推進箭頭與底框。
- 正式 `game.html` 和 `testplay.html` 使用同一組語意 HTML 工具列。可視標籤改為 LOG／AUTO／SKIP／SAVE／LOAD／CONFIG，中文 `aria-label` 和既有操作事件保持不變；面板置中並留出外側空間，工具列疊在素材原有控制列區域。
- CSS 依選項與一般對話分配面板高度；直向小螢幕隱藏可視英文文字但保留六個圖示和中文輔助名稱，按鈕觸控高度維持至少 44px。SVG 圖示固定 18px、沿用按鈕文字色，描邊圖採無填色；AUTO／SKIP 使用填色，SKIP 的直向停止線保留描邊。底部安全區、閱讀字級和文字捲動規則保留。

## 驗證結果

- Pages workflow 的 18 個固定 validators 全數通過；`validate-game-shells.js` 另外保護正式頁／testplay 六項控制、ARIA 名稱、18px SVG 描邊／填色、SKIP 停止線、參考圖標籤、44px 目標、框體錨點和素材尺寸。
- `node --check site/game.js`、`node --check site/chapter-intro.js` 與 `git diff --check` 通過。
- commit `1f8c4b8` 推送後 Pages run [45736643919](https://github.com/310111-design/hina-galgame/actions/runs/45736643919) build／deploy 成功；正式頁、試玩頁、CSS 與 `dialogue-frame-runtime.png` 均回應 HTTP 200。這只能確認部署，不補足缺少的即時畫面與實機驗收。
- runtime 衍生圖與來源圖像素以 Pillow 離線合成檢視，清理列沒有明顯矩形色帶，框體結構仍完整。這只是素材檢視，不能證明瀏覽器 CSS 排版。

## 未完成驗收

本輪 Computer Use 沒有可用的瀏覽器分頁介面，因此沒有本機或公開頁即時畫面、390×844／844×390／1440×900 viewport、iPhone Safari、觸控或真實讀屏器證據；未操作遊戲或存檔。這個 UI 樣式實作完成，但整體 UI／跨裝置 QA 仍未完成；恢復可用瀏覽器後，先以獨立 testplay 路徑目視檢查。

## 可重用範圍

適用於需要把完整透明美術框與真實網頁控制疊合的 UI。保留來源圖；從衍生圖清除烘焙控制字；以可存取 DOM 疊加並確認定位、觸控、鍵盤焦點及讀屏名稱；素材和 validator 都不能替代真實 viewport 檢視。
