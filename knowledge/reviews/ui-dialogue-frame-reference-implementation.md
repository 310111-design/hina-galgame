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
- 2026-11-26 後續以公開 Pages `testplay.html` 進行實際桌面畫面確認：1197×716 viewport 中，完整紫黑金屬框、左上「空崎陽奈」姓名牌、對話文字、右側推進箭頭，以及 LOG／AUTO／SKIP／SAVE／LOAD／CONFIG 六項控制均顯示於預期區域；DOM 同時可讀到「空崎陽奈：…」及六個中文輔助名稱。檢查時在新隔離試玩頁由 P01 推進至陽奈第一句，沒有選擇分支或啟動主線；試玩頁自動存檔／已讀索引因此有局部變化。
- runtime 全路徑測試 commit `f36445a` 的 Pages run [45737982080](https://github.com/310111-design/hina-galgame/actions/runs/45737982080) build／deploy 成功；本次確認的 `testplay.html` 與 `game.css` 均 HTTP 200。這是已部署程式的瀏覽器目視結果，不是新提交內容的部署驗收。

## 2026-11-26 內文寬度修正

- **回饋與原因：** 使用者指出台詞沒有延伸到對話框右側。舊 `.game-stage:not([data-phase="choice"]) .story > p` 為避開舞台上的人物立繪，將對話內文限為桌面 48%、窄螢幕 35%；在新設計中台詞已位於人物前方的底部閱讀框，這條左欄限制反而留下過多空白。
- **修正：** 讓一般台詞段落寬度為對話框內寬 100%，保留響應式左右 padding 和 `box-sizing: border-box`；具名陽奈台詞把姓名牌下方留白增加至桌面 `clamp(56px, 8dvh, 82px)`、窄螢幕 `clamp(52px, 8dvh, 70px)`。正式頁與試玩頁同步改用 `dialogue-full-width-v1-20261126` CSS URL，避免沿用舊樣式快取。
- **驗證：** `node scripts/validate-game-shells.js` 通過；commit `379dc48` 的 Pages run [45738990538](https://github.com/310111-design/hina-galgame/actions/runs/45738990538) build／deploy 成功，快取參數更新 commit `8903d53` 的 run [45739190491](https://github.com/310111-design/hina-galgame/actions/runs/45739190491) 亦成功。重新載入公開 testplay 後，約 718×718 畫面的較長旁白從原本窄左欄改為橫跨對話框並在右側框內換行；DOM 朗讀完整台詞，未選新分支或操作正式主線。
- **前後差異：** 1197×716 截圖中的姓名牌／框體確認仍有效，但當時內文尚套用舊窄欄規則；修正後的 718×718 testplay 截圖確認長旁白使用完整寬度。兩張截圖各自只代表所述 viewport／狀態。

## 2026-11-26 台詞下移

- **調整：** 依公開 testplay 畫面回饋，將陽奈台詞的姓名牌下方留白增加 20px；桌面與窄螢幕分別保留原有 `8dvh` 伸縮，選項與工具列不變。正式頁與試玩頁更新 CSS 查詢版本以刷新快取。
- **驗收：** commit `c83b548` 的 Pages run [45824615337](https://github.com/310111-design/hina-galgame/actions/runs/45824615337) build／deploy 成功。重新載入公開 testplay，在 803×694 桌面畫面推進到第一句具名台詞，確認姓名牌與正文的距離增加，無選擇分支；重載後試玩回到 P01，僅推進一行，正式主線未操作。
- **限制：** 本次只驗收一個桌面 viewport 及一行具名台詞。手機直向／橫向、其他高度、不同字級、iPhone Safari 與讀屏器仍待驗。

## 未完成驗收

目前內文新樣式只在約 718×718 viewport 的一條較長旁白目視確認；具名姓名牌的定位曾在舊 1197×716 桌面畫面確認，但尚未在新內距搭配下重驗。尚未覆蓋 390×844／844×390 手機尺寸、iPhone Safari、安全區、觸控、其他說話者／字級、鍵盤 focus 或真實讀屏器。先前 testplay 推進會更新該頁自己的自動存檔與已讀索引，最新改寬檢查只重新載入既有 P01 狀態；正式主線未操作，整體 UI／跨裝置 QA 仍未完成。

## 可重用範圍

適用於需要把完整透明美術框與真實網頁控制疊合的 UI。保留來源圖；從衍生圖清除烘焙控制字；以可存取 DOM 疊加並確認定位、觸控、鍵盤焦點及讀屏名稱；素材和 validator 都不能替代真實 viewport 檢視。
