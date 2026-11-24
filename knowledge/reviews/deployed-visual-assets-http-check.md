# Pages runtime 素材 URL 可取用檢查

日期：2026-11-24  
範圍：目前 runtime 使用的表情 PNG、章節背景 WebP 與 SVG 角色 fallback。

## 方法與結果

依 `site/game.js` 的 `EMOTION_SPRITES`、`BACKGROUND_BY_CHAPTER` 及 `SPRITE_FALLBACK` 建立 Pages URL；背景表的值是檔名，因此加上 `assets/backgrounds/` 前綴。以 HEAD 請求檢查 **26 個唯一素材 URL**：12 張映射背景、13 張表情圖和 1 張 SVG fallback，結果全部 HTTP 200，無失敗項目。檢查時最新 Pages workflow run `45313218561`（commit `3db9d77`）成功。

## 驗證界線

HEAD 成功只代表 URL 可取用，不能證明瀏覽器已下載／解碼圖片，亦不驗證各情緒切換、缺圖 fallback、背景主體位置、裁切、透明邊緣、效能或不同裝置顯示。`knowledge/device-qa-checklist.md` 的圖像顯示與實機項目維持未完成。

## 2026-11-24 WebP runtime 更新後的完整 URL 複查

表情 runtime 已改為 lossless WebP，來源 PNG 保留作回退。再次從現行 `site/game.js` 的 `BACKGROUND_BY_CHAPTER`、`EMOTION_SPRITES` 和 sprite fallback 推導網址，並加入正式首頁、`game.html`、`game.js`、`game-data.js`、`testplay.html` 入口：12 張映射背景、13 張 WebP、13 張同名 PNG、1 張 SVG 與 5 個頁面共 44 個唯一 URL 均 HTTP 200。背景路徑由 runtime 的檔名補上 `assets/backgrounds/`；角色映射已確認從 WebP 優先載入。

檢查對應部署包含 `d877fc7` 的 Pages workflow run `45316426130` 成功部署後的版本；最近一次相關文件推送 `2b5b44f` 的 Pages run `45317485605` 亦成功。這仍只是伺服器回應檢查，不能代替真實瀏覽器解碼、fallback 操作、圖片裁切、效能或實機 QA；角色 WebP 的轉檔與 fallback 限制見 `character-sprite-webp-review.md`。
