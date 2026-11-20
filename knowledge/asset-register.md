# 視覺素材清冊

素材依情境製作；每項完成後記錄檔案路徑、用途、prompt 及版本。初期以可重用的背景和立繪為主，避免過早製作缺少上下文的事件圖。

| ID | 素材 | 狀態 | 規格與用途 | 建議路徑 |
| --- | --- | --- | --- | --- |
| BG-001 | 風紀委員會辦公室・黃昏 | <badge>已生成並入庫，已接入遊戲</badge> | 原始生成圖 1672×941；部署版壓縮為 512×288 WebP（16:9），金紫夕光、百葉窗影、文件、會議桌與熱飲，無人物與文字；作為辦公室場景底圖，角色另層疊加。 | `site/assets/backgrounds/prefect-office-evening-v01.webp` |
| BG-002 | 格黑娜校舍屋頂・夕陽 | 已視覺盤點並接入 | 使用者提供的 IMG_2959.jpeg 建立語意別名；供 C03 屋頂章節及 P01／P02 的 C 分支使用，原始 IMG 檔保留。 | `site/assets/backgrounds/rooftop-sunset-v01.jpeg` |
| SPR-001 | 空崎陽奈基礎立繪與表情 | 8 張 PNG 已檢視，暫不作為 sprite | 8 張均為不透明全身插畫，姿勢／服裝／構圖不一致；IMG_2975 僅作基礎立繪風格參考。正式 sprite 需依 `knowledge/character-sprite-spec.md` 重新生成真正透明且構圖一致的整組圖片。原始檔名完整保留。 | `site/assets/characters/` |
| CG-001 | 開場熱飲事件 CG | 待正文確認 | 只在場景構圖與角色狀態確定後製作，避免與立繪需求重複。 | `assets/cg/opening-hot-drink-v01.png` |

## 風格基準（暫定）

- **用途：** 傳統 Galgame 場景底圖，16:9 橫向構圖，能與前景 sprite 分層。
- **畫風：** 乾淨的動畫背景插畫，不仿照指定在世藝術家；溫暖夕照、柔和陰影、細緻室內材質。
- **色彩：** 金紅夕光搭配暗紫／木色陰影，明暗柔和，室內仍可閱讀。
- **排除：** 不含人物、文字、標誌、浮水印、對話框和遊戲 UI；不要把原作角色直接畫進背景。

> 素材流程：使用內建圖像生成先製作無人物背景，再檢查構圖、壓縮為適合網頁載入的 WebP、入庫並接入場景資料；原始高解析檔留作工作備份。


## 已入庫原始素材與檢查狀態

以下列出使用者提供的原始檔路徑。13 張背景已完成視覺分類與章節映射；8 張角色 PNG 已逐張預覽並建立暫定分類，但確認為不透明參考插畫，未接入 sprite。

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

- **正式 sprite 重新生成規格：** `knowledge/character-sprite-spec.md`

- **集中預覽頁：** https://310111-design.github.io/hina-galgame/character-preview.html（以原始檔名與透明棋盤格展示；頁面不預設表情標籤）

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

- 目前 `EMOTION_SPRITES` 已清空，正式版與試玩版改回 assets/hina-sprite.svg 佔位圖；8 張 PNG 保留作為美術參考，不直接疊在背景上。
- 角色圖檔雖為 1104×1824 RGBA，但實際像素 alpha 全部為 255，背景完全不透明；因此不符合透明 sprite 圖層需求。
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

**視覺驗收注意：** 多張辦公室／咖啡店背景的告示、文件或招牌含有生成式文字細節；目前以背景柔焦、暗化遮罩降低干擾，仍應在實際遊戲畫面檢查文字安全區。D08F 已改為書店咖啡角，使用 cafe-day-v01.jpeg；D08P 改為校園庭院社區閱讀活動，使用 school-courtyard-sunset-v01.jpeg。原始 JPEG 尚未轉 WebP，壓縮與載入效能驗收仍待處理。


## CI 圖片中繼資料（2026-11-20）

由 `scripts/inspect-visual-assets.js` 在 GitHub Actions 讀取檔案標頭與 SHA-256；此檢查不代表已看過角色畫面內容。

### 角色 PNG

8 張皆為 **1104×1824、8-bit RGBA、含 alpha 通道；實際像素 alpha 全為 255（不透明）**；SHA-256 均不同，沒有完全重複檔。

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

**處理結論：** 角色 PNG 的尺寸符合立式插畫比例，但雖有 RGBA alpha 通道，實際像素全不透明，因此不能直接當透明 sprite 疊加；目前保留為參考插畫，需重新產生真正透明且姿勢一致的角色差分。每張約 1.84–2.38 MB，手機載入前仍需評估最佳化。背景 JPEG 單張約 0.13–0.27 MB，暫時不屬於最急迫的壓縮瓶頸。


## 角色 PNG 視覺檢查（2026-11-20）

**結論：這批圖適合保留為全身插畫／生成參考，不適合直接當作可切換表情的透明 sprite。**雖然 PNG 格式為 RGBA，但實際檢查每個像素的 alpha 值皆為 255，沒有透明像素；背景是淺色實底。姿勢、服裝細節、光環位置與人物比例也有差異。

| 檔案 | 暫定視覺分類 | 觀察與限制 |
| --- | --- | --- |
| IMG_2972.png | 冷靜／略顯疲倦 | 正面全身；光環上緣被裁切。 |
| IMG_2973.png | 柔和微笑 | 光環與全身較完整；眼睛偏紫，與其他多數圖的紅眼有差異。 |
| IMG_2975.png | 自然微笑／基礎參考候選 | 正面、姿勢穩定，光環與全身較完整；目前最適合作為重生 sprite 的參考圖，不代表可直接上線。 |
| IMG_2976.png | 驚訝 | 張嘴、眼睛睜大；光環上緣被裁切。 |
| IMG_2977.png | 困惑 | 圖中問號是畫面的一部分，光環上緣被裁切，不是純表情差分。 |
| IMG_2978.png | 擔心／不安 | 表情較低落；服裝與外套細節和其他圖有差異。 |
| IMG_2979.png | 生氣／警戒 | 眉眼明顯嚴肅；姿勢與服裝細節不同。 |
| IMG_2980.png | 害羞 | 臉部泛紅、視線向下、雙手靠近；光環上緣接近裁切，腳部也靠近畫面下緣。 |

**建議用途：** 保留八張原圖作為情緒與造型參考；以 IMG_2975.png 作為新一輪基礎 sprite 的視覺參考，重新生成同一姿勢、同一服裝／配件、同一鏡頭與完整光環／鞋底，並要求真正透明背景。暫不以自動去背直接處理，避免淺色頭髮與白色外套邊緣被誤刪。
