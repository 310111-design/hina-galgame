# 功能選單按鈕的可存取名稱

日期：2026-11-25  
範圍：正式 `game.html` 與內部 `testplay.html` 的遊戲功能選單。

## 發現與修正

- Codex 內建瀏覽器打開「功能」選單後，輔助功能樹將章節、紀錄／設定、存檔、讀檔及重新開始等可見文字按鈕列為沒有名稱的按鈕節點；畫面上仍可看見按鈕文字。
- 在兩個殼層為「選擇章節」「返回主線」「對話紀錄與設定」「存檔」「讀檔」「從序章重來」加入明確 `aria-label`；全螢幕原有「切換全螢幕」名稱保留。
- `validate-game-shells.js` 現在逐一驗證兩頁的功能選單名稱，避免正式版與 testplay 的互動 shell 不一致。

## 驗證與界線

本機 `node scripts/validate-game-shells.js` 通過：兩個頁殼皆有完整 JavaScript ID、六個具名工具列控制、預期焦點外框對比與 UI 圖片資產。`7bc1597` 已推送；GitHub Pages Actions run [45647365552](https://github.com/310111-design/hina-galgame/actions/runs/45647365552) build／deploy 成功，公開 `game.html` 回應內容也包含 `aria-label="選擇章節"`。

部署後在 Codex 內建瀏覽器重載公開頁並展開功能選單，輔助功能樹仍將多個按鈕列為無名稱。這與部署 HTML 的明確屬性不一致，可能是瀏覽器樹擷取差異，也可能是 runtime／平台可存取名稱計算問題；目前證據不足以定因。本機靜態 validator 不可取代公開頁 AX 樹或真實讀屏器驗收。下一步應以能讀取 computed accessible name 的瀏覽器檢查或 VoiceOver／NVDA 實測釐清，再決定是否需調整 markup。

鍵盤焦點與 iPhone Safari 仍待驗收；本次檢查不代表真實讀屏器已測試。
