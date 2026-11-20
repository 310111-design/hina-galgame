# 視覺素材清冊

素材依情境製作；每項完成後記錄檔案路徑、用途、prompt 及版本。初期以可重用的背景和立繪為主，避免過早製作缺少上下文的事件圖。

| ID | 素材 | 狀態 | 規格與用途 | 建議路徑 |
| --- | --- | --- | --- | --- |
| BG-001 | 風紀委員會辦公室・黃昏 | <badge>已生成並入庫，已接入遊戲</badge> | 原始生成圖 1672×941；部署版壓縮為 512×288 WebP（16:9），金紫夕光、百葉窗影、文件、會議桌與熱飲，無人物與文字；作為辦公室場景底圖，角色另層疊加。 | `site/assets/backgrounds/prefect-office-evening-v01.webp` |
| BG-002 | 格黑娜校舍屋頂・黃昏 | 待章節確認 | 作為初始 C 分支的候選背景；需先確認實際正文是否保留屋頂事件。 | `assets/backgrounds/gehenna-rooftop-evening-v01.png` |
| SPR-001 | 空崎陽奈基礎立繪與表情 | 8 張 PNG 已接入，暫定映射待視覺驗收 | 依先前 8 種表情提示詞的生成／匯出順序暫接：2972 normal、2973 smile、2975 happy、2976 surprised、2977 confused、2978 worried、2979 angry、2980 shy。此對照尚未看圖驗證；保留原始檔名，IMG_2972 作缺圖回退。 | `site/assets/characters/` |
| CG-001 | 開場熱飲事件 CG | 待正文確認 | 只在場景構圖與角色狀態確定後製作，避免與立繪需求重複。 | `assets/cg/opening-hot-drink-v01.png` |

## 風格基準（暫定）

- **用途：** 傳統 Galgame 場景底圖，16:9 橫向構圖，能與前景 sprite 分層。
- **畫風：** 乾淨的動畫背景插畫，不仿照指定在世藝術家；溫暖夕照、柔和陰影、細緻室內材質。
- **色彩：** 金紅夕光搭配暗紫／木色陰影，明暗柔和，室內仍可閱讀。
- **排除：** 不含人物、文字、標誌、浮水印、對話框和遊戲 UI；不要把原作角色直接畫進背景。

> 素材流程：使用內建圖像生成先製作無人物背景，再檢查構圖、壓縮為適合網頁載入的 WebP、入庫並接入場景資料；原始高解析檔留作工作備份。


## 已入庫但尚未視覺驗收的原始素材

以下列出使用者提供的原始檔路徑。13 張背景已完成視覺分類；8 張角色 PNG 已接入暫定表情映射，技術 metadata 已確認，但仍未逐張預覽畫面內容。

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

- 目前 `EMOTION_SPRITES` 已改為指向 `assets/characters/IMG_*.png`，以先前提示詞順序暫時對應；未逐張視覺檢查前，不可把此對照當成正式分類。缺圖回退使用 IMG_2972。
- 角色圖已確認 1104×1824 RGBA 透明通道；仍需視覺確認完整頭／腳、透明邊緣、人物位置、角色一致性及暫定表情映射。正式版與試玩版目前共用 IMG_2972 作為初始立繪。
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


## CI 圖片中繼資料（2026-11-20）

由 `scripts/inspect-visual-assets.js` 在 GitHub Actions 讀取檔案標頭與 SHA-256；此檢查不代表已看過角色畫面內容。

### 角色 PNG

8 張皆為 **1104×1824、8-bit RGBA、含 alpha 透明通道**；SHA-256 均不同，沒有完全重複檔。

| 原始檔 | 大小（bytes） | 約 MB |
| --- | ---: | ---: |
| `IMG_2972.png` | 2,383,269 | 2.38 |
| `IMG_2973.png` | 1,946,325 | 1.95 |
| `IMG_2975.png` | 2,104,746 | 2.10 |
| `IMG_2976.png` | 2,013,442 | 2.01 |
| `IMG_2977.png` | 1,877,155 | 1.88 |
| `IMG_2978.png` | 2,020,064 | 2.02 |
| `IMG_2979.png` | 2,100,129 | 2.10 |
| `IMG_2980.png` | 1,843,274 | 1.84 |

### 背景 JPEG

13 張皆為 JPEG，SHA-256 均不同；尺寸為 1376×768 或 1408×768。原始 IMG_2953～IMG_2965 與語意化檔名為相同內容別名，已依 SHA-256 分組，沒有重複計數。

| 原始檔 | 尺寸 | 大小（bytes） |
| --- | ---: | ---: |
| `IMG_2953.jpeg` | 1376×768 | 174,898 |
| `IMG_2954.jpeg` | 1376×768 | 155,301 |
| `IMG_2955.jpeg` | 1376×768 | 202,650 |
| `IMG_2956.jpeg` | 1376×768 | 125,491 |
| `IMG_2957.jpeg` | 1376×768 | 191,442 |
| `IMG_2958.jpeg` | 1408×768 | 153,129 |
| `IMG_2959.jpeg` | 1408×768 | 145,076 |
| `IMG_2960.jpeg` | 1408×768 | 273,691 |
| `IMG_2961.jpeg` | 1408×768 | 240,027 |
| `IMG_2962.jpeg` | 1376×768 | 224,731 |
| `IMG_2963.jpeg` | 1376×768 | 216,411 |
| `IMG_2964.jpeg` | 1408×768 | 185,885 |
| `IMG_2965.jpeg` | 1408×768 | 222,203 |

**處理結論：** 角色 PNG 的透明通道與尺寸符合後續角色立繪整合的技術條件，但每張約 1.84–2.38 MB，手機載入前仍需評估透明 WebP／PNG 最佳化；目前尚未視覺分類為基礎立繪或情緒差分。背景 JPEG 單張約 0.13–0.27 MB，暫時不屬於最急迫的壓縮瓶頸。
