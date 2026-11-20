# 視覺素材清冊

素材依情境製作；每項完成後記錄檔案路徑、用途、prompt 及版本。初期以可重用的背景和立繪為主，避免過早製作缺少上下文的事件圖。

| ID | 素材 | 狀態 | 規格與用途 | 建議路徑 |
| --- | --- | --- | --- | --- |
| BG-001 | 風紀委員會辦公室・黃昏 | <badge>已生成並入庫，已接入遊戲</badge> | 原始生成圖 1672×941；部署版壓縮為 512×288 WebP（16:9），金紫夕光、百葉窗影、文件、會議桌與熱飲，無人物與文字；作為辦公室場景底圖，角色另層疊加。 | `site/assets/backgrounds/prefect-office-evening-v01.webp` |
| BG-002 | 格黑娜校舍屋頂・黃昏 | 待章節確認 | 作為初始 C 分支的候選背景；需先確認實際正文是否保留屋頂事件。 | `assets/backgrounds/gehenna-rooftop-evening-v01.png` |
| SPR-001 | 空崎陽奈基礎立繪與表情 | 8 張 PNG 已入庫，待逐張檢視與分類 | 原始輸出保存在 `site/assets/characters/`，尚未確認哪張是基礎立繪或表情差分；未檢視前不改名、不猜測情緒、不接入。遊戲暫用 SVG 回退。 | `site/assets/characters/`、`site/assets/hina-sprite.svg` |
| CG-001 | 開場熱飲事件 CG | 待正文確認 | 只在場景構圖與角色狀態確定後製作，避免與立繪需求重複。 | `assets/cg/opening-hot-drink-v01.png` |

## 風格基準（暫定）

- **用途：** 傳統 Galgame 場景底圖，16:9 橫向構圖，能與前景 sprite 分層。
- **畫風：** 乾淨的動畫背景插畫，不仿照指定在世藝術家；溫暖夕照、柔和陰影、細緻室內材質。
- **色彩：** 金紅夕光搭配暗紫／木色陰影，明暗柔和，室內仍可閱讀。
- **排除：** 不含人物、文字、標誌、浮水印、對話框和遊戲 UI；不要把原作角色直接畫進背景。

> 素材流程：使用內建圖像生成先製作無人物背景，再檢查構圖、壓縮為適合網頁載入的 WebP、入庫並接入場景資料；原始高解析檔留作工作備份。


## 已入庫但尚未視覺驗收的原始素材

以下只記錄檔案存在與來源分類，不代表已確認畫面內容、尺寸、透明通道或可用性。正式整合前必須逐張檢視。

### 背景原始圖（使用者提供）

- `site/assets/backgrounds/IMG_2953.jpeg`
- `site/assets/backgrounds/IMG_2954.jpeg`
- `site/assets/backgrounds/IMG_2955.jpeg`
- `site/assets/backgrounds/IMG_2956.jpeg`
- `site/assets/backgrounds/IMG_2957.jpeg`
- `site/assets/backgrounds/IMG_2958.jpeg`
- `site/assets/backgrounds/IMG_2959.jpeg`
- `site/assets/backgrounds/IMG_2960.jpeg`
- `site/assets/backgrounds/IMG_2961.jpeg`
- `site/assets/backgrounds/IMG_2962.jpeg`
- `site/assets/backgrounds/IMG_2963.jpeg`
- `site/assets/backgrounds/IMG_2964.jpeg`
- `site/assets/backgrounds/IMG_2965.jpeg`

### 角色輸出 PNG（使用者提供）

- `site/assets/characters/IMG_2972.png`
- `site/assets/characters/IMG_2973.png`
- `site/assets/characters/IMG_2975.png`
- `site/assets/characters/IMG_2976.png`
- `site/assets/characters/IMG_2977.png`
- `site/assets/characters/IMG_2978.png`
- `site/assets/characters/IMG_2979.png`
- `site/assets/characters/IMG_2980.png`

### 舊角色參考圖

- 12 張 JPEG 保存在 `site/assets/characters/references/`，保留原始檔名，不當作遊戲立繪直接載入。

### 接入前注意

- 目前遊戲的 `EMOTION_SPRITES` 仍指向 `assets/hina/emotion-*.png`，該資料夾尚未建立；在角色圖檢視與分類完成前，SVG 是預期回退，不可把 8 張 PNG 任意對應到情緒。
- 角色圖需確認透明背景、完整頭／腳、實際尺寸、人物位置及是否同一套服裝，再決定統一命名和載入方式。
- 背景圖需確認方向、場景內容、光線與文字安全區，再建立章節映射；不可僅依上傳順序配對章節。
