# 視覺素材清冊

素材依情境製作；每項完成後記錄檔案路徑、用途、prompt 及版本。初期以可重用的背景和立繪為主，避免過早製作缺少上下文的事件圖。

| ID | 素材 | 狀態 | 規格與用途 | 建議路徑 |
| --- | --- | --- | --- | --- |
| BG-001 | 風紀委員會辦公室・黃昏 | 已生成並接入；美術回顧待辦 | 原始生成圖 1672×941；部署版 512×288 WebP（16:9），金紫夕光、百葉窗影、文件、會議桌與熱飲，沒有角色；畫面內牆牌與文件含不可讀生成式仿字，不能當成可讀日文／中文。新規格要求避免此類假字。 | `site/assets/backgrounds/prefect-office-evening-v01.webp` |
| BG-002 | 格黑娜校舍屋頂・夕陽 | 已視覺盤點並接入 | 使用者提供的 IMG_2959.jpeg 建立語意別名；供 C03 屋頂章節及 P01／P02 的 C 分支使用，原始 IMG 檔保留。 | `site/assets/backgrounds/rooftop-sunset-v01.jpeg` |
| SPR-001 | 空崎陽奈角色參考圖 | 8 張原始 IMG PNG 保留作參考；另有 13 張新表情圖已接入正作 | 原始參考圖不覆蓋；目前遊戲使用 2026-11-23 收到的 13 張 896×1200 RGBA 表情圖，完整對照見下方素材表。 | `site/assets/characters/` |
| CG-001 | P01 開場熱飲事件 CG | 長期清單 CG-01，尚未製作；保留佔位 | AI 生成為主；以手部動作和桌邊距離建立初期相處感。16:9、至少 1920×1080 母檔，runtime WebP；先按 `knowledge/art-requests/character-and-cg-list.md` 驗收。 | `site/assets/cg/cg-01-p01-hot-drink.webp` |
| CG-002 | B02 團隊首次試行交接流程 | 長期清單 CG-02，尚未製作；保留佔位 | 共通事件；以多人工作動線呈現陽奈開始分享工作方法。依下方長期標準保留高解析母檔，runtime WebP。 | `site/assets/cg/cg-02-b02-team-handoff.webp` |
| CG-003 | B08 陽奈自主休息 | 長期清單 CG-03，尚未製作；保留佔位 | 共通事件；陽奈不看公務訊息、獨自休息，以留白與安靜環境表現自主休息。 | `site/assets/cg/cg-03-b08-rest.webp` |
| CG-004 | C06 校園篇告別 | 長期清單 CG-04，尚未製作；保留佔位 | 共通事件；熟悉校園與即將分別的情緒，畫面需對應正文中的約定。 | `site/assets/cg/cg-04-c06-farewell.webp` |
| CG-005 | D01 成年後重逢 | 長期清單 CG-05，尚未製作；保留佔位 | 共通事件；畢業五年後在車站附近咖啡店重逢，使用成年篇陽奈設計與雨後街景。 | `site/assets/cg/cg-05-d01-reunion.webp` |
| CG-006 | D06 成年篇關係方向選擇 | 長期清單 CG-06，尚未製作；保留佔位 | 共通事件；朋友／搭檔／戀愛選擇前後的成熟平等互動，不預設任一路線已成立。 | `site/assets/cg/cg-06-d06-route-choice.webp` |
| CG-007 | 朋友線分享日常近況 | 長期清單 CG-07，尚未製作；保留佔位 | 朋友線 D08F；在咖啡店分享日常近況。 | `site/assets/cg/cg-07-d08f-daily-life.webp` |
| CG-008 | 朋友線週末散步 | 長期清單 CG-08，尚未製作；保留佔位 | 朋友線 D08F；散步途中停在街邊小店。 | `site/assets/cg/cg-08-d08f-weekend-walk.webp` |
| CG-009 | 朋友線互相傾聽 | 長期清單 CG-09，尚未製作；保留佔位 | 朋友線 D08F；分享近況並保留自在距離。 | `site/assets/cg/cg-09-d08f-listening.webp` |
| CG-010 | 朋友線車站道別 | 長期清單 CG-10，尚未製作；保留佔位 | 朋友線 D08F；在車站前自然揮手道別。 | `site/assets/cg/cg-10-d08f-station-goodbye.webp` |
| CG-011 | 搭檔線圖書館庭院分工 | 長期清單 CG-11，尚未製作；保留佔位 | 搭檔線 D08P；在社區圖書館戶外庭院共同確認活動分工。 | `site/assets/cg/cg-11-d08p-library-planning.webp` |
| CG-012 | 搭檔線整理活動資料 | 長期清單 CG-12，尚未製作；保留佔位 | 搭檔線 D08P；並肩整理活動資料與場地。 | `site/assets/cg/cg-12-d08p-event-setup.webp` |
| CG-013 | 搭檔線任務後休息 | 長期清單 CG-13，尚未製作；保留佔位 | 搭檔線 D08P；完成任務後在戶外長椅休息。 | `site/assets/cg/cg-13-d08p-bench-rest.webp` |
| CG-014 | 搭檔線確認下次合作 | 長期清單 CG-14，尚未製作；保留佔位 | 搭檔線 D08P；日落時確認下一次合作安排。 | `site/assets/cg/cg-14-d08p-next-project.webp` |
| CG-015 | 戀愛線坦白心意 | 長期清單 CG-15，尚未製作；保留佔位 | 戀愛線 D08R；成年後在咖啡店坦白彼此心意。 | `site/assets/cg/cg-15-d08r-confession.webp` |
| CG-016 | 戀愛線確認關係界線 | 長期清單 CG-16，尚未製作；保留佔位 | 戀愛線 D08R；以安靜瞬間呈現雙方確認關係與界線。 | `site/assets/cg/cg-16-d08r-boundaries.webp` |
| CG-017 | 戀愛線分享生活興趣 | 長期清單 CG-17，尚未製作；保留佔位 | 戀愛線 D08R；沿街散步並分享各自的生活興趣。 | `site/assets/cg/cg-17-d08r-shared-interests.webp` |
| CG-018 | 戀愛線確認下次見面 | 長期清單 CG-18，尚未製作；保留佔位 | 戀愛線 D08R；在車站入口前確認下次見面並道別。 | `site/assets/cg/cg-18-d08r-station-goodbye.webp` |

## 長期目標與製作標準

- **CG 數量：** 18 張：共通關鍵場景 6 張，朋友／搭檔／戀愛線各 4 張。章節與畫面清單見 `knowledge/art-requests/character-and-cg-list.md`。
- **清冊狀態：** 上表 CG-001～CG-018 分別對應長期清單 CG-01～CG-18；目前 18 張均未製作、保留佔位，不以建議路徑或提示詞模板表示成品已存在。
- **來源：** 新素材以 AI 生成為主；未達品質門檻時保留現有素材或佔位，不自動委託或使用其他新增來源。現有使用者 PNG／JPEG 原圖不覆蓋。
- **母檔與 runtime：** 新背景與全螢幕事件 CG 的母檔至少 1920×1080、16:9；runtime 使用最佳化 WebP。角色 sprite 依 `knowledge/character-sprite-spec.md` 以 896×1200 作 runtime 相容基準，保留透明 PNG 母檔。
- **來源紀錄：** 每項 AI 素材記錄用途、生成工具／模型版本、日期、提示詞、參考來源、檔案版本及驗收狀態；母檔和 runtime 衍生檔分開標示。
- **品質門檻：** 檢查角色辨識度、解剖與手部、透視、衣物配件、光影、場景道具、假字／浮水印、透明邊緣、壓縮瑕疵、對話框遮擋及三種 viewport 裁切；品質不合格不標記為完成。
- **試作順序：** 批量生成前先各做一組代表背景、事件 CG 和成年陽奈立繪，通過人工檢視後再擴大製作。
- **CG 分鏡提示：** CG-01～CG-18 的逐張鏡頭、人物動作、光線與分支中性要求集中記於 `knowledge/art-prompts.md`；此提示只表示可進入生成前製，不改變上方 18 項「尚未製作；保留佔位」狀態。

## 風格基準（暫定）

- **用途：** 傳統 Galgame 場景底圖，16:9 橫向構圖，母檔至少 1920×1080，能與前景 sprite 分層。
- **畫風：** 乾淨的動畫背景插畫，不仿照指定在世藝術家；以溫暖夕照、柔和陰影和細緻室內材質為基準。
- **色彩：** 校園篇以金紅夕光、暗紫／木色陰影為主；成年篇可用咖啡店暖光與雨夜冷色形成階段對比。保持對話文字可讀。
- **構圖：** 主要焦點放在人物與對話框不會遮住的位置；底部預留約 30% 作為低細節文字安全區，並在直向、橫向和桌面 viewport 檢查裁切。
- **排除：** 不含人物、任何假字／不可讀文字、標誌、浮水印、對話框和遊戲 UI；不要把原作角色直接畫進背景。

> 素材流程：以可用 AI 圖像生成工具先作代表樣本，人工驗收構圖、風格與假字後再批次製作；保留高解析母檔，輸出最佳化 WebP，登記來源與版本並接入場景資料。生成品質未達標或工具不可用時保留佔位；不因提示詞存在而視為素材完成。


## 已入庫原始素材與檢查狀態

以下列出使用者提供的原始檔路徑。13 張背景均已完成視覺分類及 WebP 版本，其中 12 張映射至 runtime 章節，校園中庭保留備用；最初的 8 張角色 IMG PNG 僅作不透明參考插畫保存。2026-11-23 新提供的 13 張透明表情圖已另存並接入 sprite，見下表。

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

- **集中預覽頁：** https://310111-design.github.io/hina-galgame/character-preview.html（以使用者指定順序的語意檔名與表情標籤展示；原始檔案保留）

原始檔案保留，並新增同內容語意別名（依使用者指定順序）：
- `hina_normal.png` — 普通（來源 `IMG_2972.png`）
- `hina_smile.png` — 微笑（來源 `IMG_2973.png`）
- `hina_happy.png` — 開心（來源 `IMG_2975.png`）
- `hina_surprised.png` — 驚訝（來源 `IMG_2976.png`）
- `hina_confused.png` — 困惑（來源 `IMG_2977.png`）
- `hina_worried.png` — 擔憂（來源 `IMG_2978.png`）
- `hina_angry.png` — 生氣（來源 `IMG_2979.png`）
- `hina_shy.png` — 害羞（來源 `IMG_2980.png`）

### 舊角色參考圖

- 12 張 JPEG 保存在 `site/assets/characters/references/`，保留原始檔名，不當作遊戲立繪直接載入。

### 目前 runtime 接入狀態

- `site/game.js` 的 `EMOTION_SPRITES` 使用 2026-11-23 表情 PNG 的 13 張無損 WebP runtime 副本，依對話 mood 切換；原 PNG 保留，WebP 失敗時退回對應 PNG，再失敗才使用 `assets/hina-sprite.svg`。像素完全相同，傳輸總量減少 39.2%。
- 2026-11-22 暫接的八張 `hina-cutout-v2-*.png` 已被 11-23 的完整表情組替代；最初八張不透明 `IMG_*.png` 僅作參考圖，兩組都不再是目前情緒映射。
- 13 張使用者提供背景均有 WebP 版本，其中 12 張映射至 runtime 章節，校園中庭保留備用；生成的黃昏辦公室背景另供企劃首頁。仍需實機檢查文字安全區、裁切、載入速度與色帶；角色表情的姿勢差異與畫面邊緣也待跨裝置驗收。

### 歷史驗收：最初八張 IMG 參考圖（2026-11-20）

以下 alpha 與構圖判定只適用於最初的八張 1104×1824 `IMG_*.png`，不可套用到 2026-11-23 接入的 13 張表情圖。


## 背景素材視覺盤點與語意對照

13 張背景已逐張預覽；新增語意化路徑使用相同 Git blob，原始 IMG 檔名完整保留，不重複上傳圖像內容。

| 原始檔 | 語意化來源 JPEG | Runtime WebP | 視覺分類 | 主要用途 |
| --- | --- | --- | --- | --- |
| `IMG_2953.jpeg` | `office-sunset-v01.jpeg` | `office-sunset-v01.webp` | 風紀委員會辦公室・夕照 | P01／A01–A03 |
| `IMG_2954.jpeg` | `office-overcast-v01.jpeg` | `office-overcast-v01.webp` | 風紀委員會辦公室・陰天 | P02／B04–B06／C04 |
| `IMG_2955.jpeg` | `office-rainy-day-v01.jpeg` | `office-rainy-day-v01.webp` | 風紀委員會辦公室・雨天 | B03 |
| `IMG_2956.jpeg` | `office-night-v01.jpeg` | `office-night-v01.webp` | 風紀委員會辦公室・夜間桌燈 | A05–A06／B07–B08 |
| `IMG_2957.jpeg` | `office-day-v01.jpeg` | `office-day-v01.webp` | 風紀委員會辦公室・白天 | P03／B01–B02／C01–C02／C05 |
| `IMG_2958.jpeg` | `school-corridor-sunset-v01.jpeg` | `school-corridor-sunset-v01.webp` | 校舍走廊・夕照 | A04 |
| `IMG_2959.jpeg` | `rooftop-sunset-v01.jpeg` | `rooftop-sunset-v01.webp` | 校舍屋頂・夕陽 | C03及 P01／P02 的 C 分支 |
| `IMG_2960.jpeg` | `school-courtyard-sunset-v01.jpeg` | `school-courtyard-sunset-v01.webp` | 校園中庭・夕照 | 暫不接入成年篇；保留為校園場景備用素材 |
| `IMG_2961.jpeg` | `school-gate-evening-v01.jpeg` | `school-gate-evening-v01.webp` | 校門・傍晚 | C06 |
| `IMG_2962.jpeg` | `cafe-day-v01.jpeg` | `cafe-day-v01.webp` | 車站附近咖啡店・白天 | D01／D05／D08F |
| `IMG_2963.jpeg` | `cafe-rainy-evening-v01.jpeg` | `cafe-rainy-evening-v01.webp` | 車站附近咖啡店・雨夜 | D02／D08R |
| `IMG_2964.jpeg` | `home-living-room-day-v01.jpeg` | `home-living-room-day-v01.webp` | 住處客廳・白天 | D03／D06 |
| `IMG_2965.jpeg` | `neighborhood-park-evening-v01.jpeg` | `neighborhood-park-evening-v01.webp` | 住宅街公園・傍晚 | D04／D07／D08P（暫定回退） |

**視覺驗收注意：** 多張辦公室／咖啡店背景的告示、文件或招牌含有生成式文字細節；目前以背景柔焦、暗化遮罩降低干擾，仍應在實際遊戲畫面檢查文字安全區。D08F 已改為書店咖啡角，使用 cafe-day-v01.jpeg；D08P 劇情改為社區圖書館戶外閱讀活動，目前 runtime 暫以 neighborhood-park-evening-v01.webp 作為公共戶外空間回退；校園中庭 WebP 保留作校園場景備用，不接入成年篇。13 張來源圖均已轉為 WebP（quality 84），總容量由 2,510,935 bytes 降至 1,852,924 bytes，減少 26.2%；目前 runtime 映射使用其中 12 張。BG-001 生成版另行保留作辦公室 CSS fallback。


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

**歷史處理結論（僅適用最初八張 IMG 圖）：** 這批 1104×1824 RGBA PNG 的實際像素 alpha 全不透明，不能直接當透明 sprite；目前保留為參考插畫，未用於 2026-11-23 的表情映射。每張約 1.84–2.38 MB。後續交付的 13 張表情圖為另一組素材，已另行檢查 alpha 並接入。


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

### 去背初稿聯絡表驗收（2026-11-22）

- **來源：** 使用者提供 `ChatGPT_圖像_2026年11月22日_上午12_31_48-removebg-preview.png`；檔案位於本機 Downloads，尚未加入 repo。
- **檢查：** 550×454、32-bit ARGB PNG；每隔 3 px 抽樣可見透明 alpha（0）、半透明 alpha（1–254）及不透明像素（255），視覺為 2×4 角色聯絡表。
- **判定：** 確認去背初稿存在且含真 alpha；但單張聯絡表解析度不足以檢查髮絲／服裝細節、原畫陰影及光環邊緣，也無法代替八張獨立原尺寸檔。不可從縮圖插值放大後當正式 sprite；待取得獨立輸出再逐張驗收。

### 歷史接入：使用者提供的八張獨立去背圖（2026-11-22，已由 11-23 表情組取代）

| 對話情緒 | 專案檔案 | 像素尺寸 | Alpha 掃描 | 判定 |
| --- | --- | --- | --- | --- |
| 普通 | `hina-cutout-v2-normal.png` | 968×1600 | 透明 841,957；半透明 289 | 歷史暫接，已取代 |
| 微笑 | `hina-cutout-v2-smile.png` | 968×1600 | 透明 825,907；半透明 33,214 | 歷史暫接，已取代 |
| 開心 | `hina-cutout-v2-happy.png` | 968×1600 | 透明 828,642；半透明 35,303 | 歷史暫接，已取代 |
| 驚訝 | `hina-cutout-v2-surprised.png` | 968×1600 | 透明 849,133；半透明 35,010 | 歷史暫接，已取代 |
| 疑惑 | `hina-cutout-v2-confused.png` | 968×1600 | 透明 820,521；半透明 33,918 | 歷史暫接，已取代 |
| 擔憂 | `hina-cutout-v2-worried.png` | 968×1600 | 透明 839,955；半透明 34,933 | 歷史暫接，已取代 |
| 生氣 | `hina-cutout-v2-angry.png` | 968×1600 | 透明 858,664；半透明 33,764 | 歷史暫接，已取代 |
| 害羞 | `hina-cutout-v2-shy.png` | 968×1600 | 透明 832,421；半透明 33,077 | 歷史暫接，已取代 |

- **來源：** `C:\Users\raytf\OneDrive\圖片\`，原圖以新檔名複製至本目錄；既有 `IMG_*.png` 和語意別名不覆蓋。
- **限制：** 八張構圖／姿勢不同；逐像素檢查可見 alpha 均延伸到畫布至少一條邊（局部邊緣像素數很少至明顯），無法從平面 PNG 還原被裁掉的線稿或髮絲。使用者指示不能修復時直接套用，故按原樣接入，遊戲仍需跨裝置觀察。
- **歷史映射：** 當時 `EMOTION_SPRITES` 依 mood 對應這八圖；此映射已由下一批 13 種表情圖取代，請以目前 runtime 區塊與 2026-11-23 表格為準。

### 2026-11-23 使用者提供的完整新表情組

| 表情標題 | 保留的原始 PNG | Runtime WebP | 尺寸／alpha | 情緒映射 |
| --- | --- | --- | --- | --- |
| 普通 | `hina-expression-neutral.png` | `hina-expression-neutral.webp` | 896×1200 RGBA；透明 676,782、半透明 20,042 | 普通、安定 |
| 微笑 | `hina-expression-smile.png` | `hina-expression-smile.webp` | 896×1200 RGBA；透明 650,890、半透明 20,273 | 微笑 |
| 開心 | `hina-expression-happy.png` | `hina-expression-happy.webp` | 896×1200 RGBA；透明 669,599、半透明 19,645 | 開心 |
| 害羞 | `hina-expression-shy.png` | `hina-expression-shy.webp` | 896×1200 RGBA；透明 672,877、半透明 19,853 | 害羞、微羞 |
| 生氣 | `hina-expression-angry.png` | `hina-expression-angry.webp` | 896×1200 RGBA；透明 679,670、半透明 20,166 | 生氣、不耐、警戒、警惕 |
| 困惑 | `hina-expression-confused.png` | `hina-expression-confused.webp` | 896×1200 RGBA；透明 729,510、半透明 18,259 | 困惑、疑惑、沉思、思考 |
| 擔憂 | `hina-expression-worried.png` | `hina-expression-worried.webp` | 896×1200 RGBA；透明 656,303、半透明 20,170 | 擔憂、不安 |
| 驚訝 | `hina-expression-surprised.png` | `hina-expression-surprised.webp` | 896×1200 RGBA；透明 667,784、半透明 18,931 | 驚訝、意外 |
| 認真 | `hina-expression-serious.png` | `hina-expression-serious.webp` | 896×1200 RGBA；透明 694,153、半透明 18,877 | 認真、嚴肅、嚴謹、克制 |
| 放鬆 | `hina-expression-relaxed.png` | `hina-expression-relaxed.webp` | 896×1200 RGBA；透明 706,176、半透明 18,811 | 放鬆、安心 |
| 困倦 | `hina-expression-sleepy.png` | `hina-expression-sleepy.webp` | 896×1200 RGBA；透明 674,675、半透明 19,702 | 困倦、疲倦、疲憊 |
| 好奇 | `hina-expression-curious.png` | `hina-expression-curious.webp` | 896×1200 RGBA；透明 679,645、半透明 41,214 | 好奇 |
| 不捨 | `hina-expression-reluctant.png` | `hina-expression-reluctant.webp` | 896×1200 RGBA；透明 683,579、半透明 9,938 | 不捨、難過、悲傷 |

- **來源：** 使用者提供 `陽奈表情2.zip`；ZIP 原檔不複製入 repo，13 張 PNG 均依標題另存遊戲檔名，舊檔不刪除。
- **判定：** 所有新圖均經逐像素 alpha 掃描，有透明與半透明像素；以使用者明確指示接入，不代表手機／桌面實機 QA 或邊緣美術驗收完成。
- **部署：** `site/game.js` 同時供正作與回歸頁使用；runtime 載入 WebP，失敗時回退 PNG 再回退 SVG。角色素材預覽頁仍連結原始 PNG。


### WebP runtime variants

- `BACKGROUND_BY_CHAPTER` 已統一指向 13 張語意化 WebP 檔案；原始 JPEG 保留，方便日後重新輸出。
- WebP 轉檔設定：Pillow quality 84、method 6；13 張合計節省 658,011 bytes（26.2%）。本機對照測試 PSNR 約 37.9～40.7 dB，仍需在實際遊戲畫面檢查細節與色帶。
