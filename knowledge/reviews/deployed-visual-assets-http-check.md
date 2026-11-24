# Pages runtime 素材 URL 可取用檢查

日期：2026-11-24  
範圍：目前 runtime 使用的表情 PNG、章節背景 WebP 與 SVG 角色 fallback。

## 方法與結果

依 `site/game.js` 的 `EMOTION_SPRITES`、`BACKGROUND_BY_CHAPTER` 及 `SPRITE_FALLBACK` 建立 Pages URL；背景表的值是檔名，因此加上 `assets/backgrounds/` 前綴。以 HEAD 請求檢查 **26 個唯一素材 URL**：12 張映射背景、13 張表情圖和 1 張 SVG fallback，結果全部 HTTP 200，無失敗項目。檢查時最新 Pages workflow run `45313218561`（commit `3db9d77`）成功。

## 驗證界線

HEAD 成功只代表 URL 可取用，不能證明瀏覽器已下載／解碼圖片，亦不驗證各情緒切換、缺圖 fallback、背景主體位置、裁切、透明邊緣、效能或不同裝置顯示。`knowledge/device-qa-checklist.md` 的圖像顯示與實機項目維持未完成。
