# 角色表情圖無損 WebP 接入檢查

日期：2026-11-24  
範圍：13 張使用者提供的 896×1200 RGBA 表情 PNG、runtime 圖片錯誤回退與 Pages CI。

## 結果

- 來源 PNG 保留原樣，未覆蓋或修改畫面。
- 以 `scripts/convert-character-sprites.py` 另產 lossless WebP，逐張重新解碼並比對 RGBA byte array；13 張皆尺寸相同且像素完全一致。
- PNG 合計 9,633,130 bytes；WebP 合計 5,855,298 bytes，減少 3,777,832 bytes（39.2%）。
- `site/game.js` 先載入 WebP；WebP 載入錯誤時嘗試同名 PNG，再失敗時載入既有 SVG 角色圖。
- `scripts/validate-character-sprite-webp.js` 檢查 runtime 引用的 13 個 WebP、lossless 標記、896×1200 尺寸、alpha、來源 PNG 對應、體積下降，以及 runtime 的 WebP→PNG→SVG 錯誤回退；已加入 Pages workflow。
- commit `d877fc7` 的 Pages workflow run `45316426130` 成功；部署後首頁、遊戲頁、`game.js`、13 張 WebP、13 張 PNG fallback 與 SVG fallback 共 30 個 URL 均 HTTP 200，線上 `game.js` 確認引用 WebP。

## 驗證界線

固定 validator 與重新解碼比對不會操作真實瀏覽器，也不能證明 Safari 或特定手機成功解碼、版面中的人物大小／透明邊緣正確、網路載入更快或快取行為正常。部署 URL 的 HTTP 成功也僅證明素材可取用。跨裝置解碼、顯示、載入與效能驗收仍依 `knowledge/device-qa-checklist.md` 保持未完成。
