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

以下列出使用者提供的原始檔路徑。13 張背景已完成視覺分類；8 張角色 PNG 仍未能預覽，尚未確認畫面內容、透明通道或可用性。

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
- 背景圖已完成初步章節映射；仍需實機檢查文字安全區、裁切與載入速度。角色圖需待可預覽後再確認透明背景、完整度及情緒分類。


## 背景素材視覺盤點與語意對照

13 張背景已逐張預覽；新增語意化路徑使用相同 Git blob，原始 IMG 檔名完整保留，不重複上傳圖像內容。

| 原始檔 | 語意化檔名 | 視覺分類 | 主要用途 |
| --- | --- | --- | --- |
| `IMG_2953.jpeg` | `office-sunset-v01.jpeg` | 風紀委員會辦公室・夕照 | P01／A01–A03 |
| `IMG_2954.jpeg` | `office-overcast-v01.jpeg` | 風紀委員會辦公室・陰天 | P02／B04–B06／C04 |
| `IMG_2955.jpeg` | `office-rainy-day-v01.jpeg` | 風紀委員會辦公室・雨天 | B03 |
| `IMG_2956.jpeg` | `office-night-v01.jpeg` | 風紀委員會辦公室・夜間桌燈 | A05–A06／B07–B08 |
| `IMG_2957.jpeg` | `office-day-v01.jpeg` | 風紀委員會辦公室・白天 | P03／B01–B02／C01–C02／C05 |
| `IMG_2958.jpeg` | `school-corridor-sunset-v01.jpeg` | 校舍走廊・夕照 | A04 |
| `IMG_2959.jpeg` | `rooftop-sunset-v01.jpeg` | 校舍屋頂・夕陽 | C03及 P01／P02 的 C 分支 |
| `IMG_2960.jpeg` | `school-courtyard-sunset-v01.jpeg` | 校園中庭・夕照 | D08P |
| `IMG_2961.jpeg` | `school-gate-evening-v01.jpeg` | 校門・傍晚 | C06 |
| `IMG_2962.jpeg` | `cafe-day-v01.jpeg` | 車站附近咖啡店・白天 | D01／D05 |
| `IMG_2963.jpeg` | `cafe-rainy-evening-v01.jpeg` | 車站附近咖啡店・雨夜 | D02／D08R |
| `IMG_2964.jpeg` | `home-living-room-day-v01.jpeg` | 住處客廳・白天 | D03／D06 |
| `IMG_2965.jpeg` | `neighborhood-park-evening-v01.jpeg` | 住宅街公園・傍晚 | D04／D07 |

**視覺驗收注意：** 多張辦公室／咖啡店背景的告示、文件或招牌含有生成式文字細節；目前以背景柔焦、暗化遮罩降低干擾，仍應在實際遊戲畫面檢查文字安全區。D08F 的書店尚無相符背景，保留場景漸層回退。原始 JPEG 尚未轉 WebP，壓縮與載入效能驗收仍待處理。


## CI 圖片中繼資料盤點（2026-11-20）

由 `scripts/inspect-visual-assets.js` 在 GitHub Actions 讀取二進位標頭；相同 SHA-256 的原始 IMG 檔與語意化檔名合併計數。以下資料只代表檔案格式與中繼資料，不代表已確認角色內容或畫面構圖。

### 角色 PNG

| 檔案 | 解析度 | 色彩／透明 | 檔案大小 |
| --- | --- | --- | ---: |
| IMG_2972.png | 1104×1824 | 8-bit RGBA／有透明 | 2,383,269 bytes |
| IMG_2973.png | 1104×1824 | 8-bit RGBA／有透明 | 1,946,325 bytes |
| IMG_2975.png | 1104×1824 | 8-bit RGBA／有透明 | 2,104,746 bytes |
| IMG_2976.png | 1104×1824 | 8-bit RGBA／有透明 | 2,013,442 bytes |
| IMG_2977.png | 1104×1824 | 8-bit RGBA／有透明 | 1,877,155 bytes |
| IMG_2978.png | 1104×1824 | 8-bit RGBA／有透明 | 2,020,064 bytes |
| IMG_2979.png | 1104×1824 | 8-bit RGBA／有透明 | 2,100,129 bytes |
| IMG_2980.png | 1104×1824 | 8-bit RGBA／有透明 | 1,843,274 bytes |

**判讀：** 八張 PNG 的尺寸與透明格式一致，適合進入同一套角色差分檢查流程；仍須實際預覽，確認是否為同一角色、是否含完整人物、基礎立繪與表情分類，以及是否存在畫面邊緣裁切。暫不按檔名猜測情緒。

### 背景 JPEG

- 13 組唯一背景內容，尺寸為 1376×768 或 1408×768（皆為約 16:9 橫向構圖）。
- 單張約 125,491～273,691 bytes。
- 原始 IMG_2953～IMG_2965 與語意化檔名經 SHA-256 確認為相同內容別名，沒有因改名而重複計入唯一圖像。
- 背景已完成初步章節映射；仍需在遊戲畫面驗收裁切、文字安全區與手機可讀性。
