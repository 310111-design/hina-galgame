# AI 美術提示詞與素材規格

**用途：** 為本作背景、角色立繪與事件 CG 提供可重複調整的提示詞模板。新增素材以 AI 生成為主；先產生代表樣本並人工驗收，再批次製作。現有 13 張使用者提供的表情原圖保持不變。

## 共通視覺方向

- 乾淨的動畫遊戲插畫、清楚輪廓、柔和材質光與可信的透視。
- 校園篇偏溫暖夕照、金紅自然光與暗紫／木色陰影；成年篇可用咖啡店暖光、雨夜冷色形成生活階段對比。
- 只使用本作核准的角色參考和自有風格描述；不指定仿作在世藝術家，不複製商業作品的構圖、UI 或現成 CG。
- 背景與 CG 不生成文字、標誌、浮水印或 UI。若場景需要告示、書名或標籤，留空白位置供日後以真正文字層製作；不可把模型生成的仿字當成可讀內容。
- 記錄工具／模型版本、日期、完整提示詞與 negative prompt、參考圖來源、seed（若可用）、輸出尺寸、檔案版本及驗收結果。

## 背景提示詞模板

輸出 16:9、至少 1920×1080 高解析母檔。依劇情填入 `[場景]`、`[時間與天氣]`、`[焦點物件]`；背景不畫角色。

```text
Wide 16:9 background illustration for a polished anime visual novel. [SCENE], [TIME AND WEATHER], [FOCAL PROPS]. Clean detailed anime environment art, coherent architecture and perspective, soft material lighting, layered depth, warm golden-hour light with restrained violet and wood-tone shadows for the school chapters; for adult scenes use warm café interiors and cooler rainy street light. Keep important focal details in the upper and middle areas, with the lower 30 percent visually quiet for a dialogue box. No people or characters. No readable text, pseudo-writing, random glyphs, signs, labels, book titles, logos, watermarks, dialogue boxes, interface elements, frames, or borders. Do not imitate a named artist or reproduce an existing game background.
```

**背景 negative prompt**

```text
person, character, human silhouette, readable text, pseudo-text, gibberish letters, random glyphs, signage, labels, book titles, logo, watermark, subtitle, UI, dialogue box, frame, border, duplicated object, inconsistent perspective, malformed architecture, blurry, low resolution, compression artifacts
```

## 學生篇角色立繪與表情差分

- runtime 畫布採 **896×1200、3:4**，PNG、8-bit RGBA；可保留同比例高解析母檔。每次只生成單張，不生成拼圖或表情表。
- 基礎立繪固定鏡頭、構圖、身形、站姿、手部位置、制服、配件與光源，再用同一張基礎圖作表情參考。完整保留頭髮、角、光環、手部和鞋底及透明安全邊界。
- 若輸出 PNG，逐像素確認有透明與半透明 alpha；RGBA 格式本身不代表背景透明。沒有真 alpha 時不可直接當正式 sprite。

**學生篇 base prompt**

```text
Sorasaki Hina from Blue Archive, faithful to the approved character reference, one character only, full-body standing character sprite, calm neutral expression, pale lavender long hair, red eyes, black curved horns, distinctive halo fully visible, Gehenna academy uniform matching the approved reference, red armband and recognizable accessories, relaxed natural standing pose, both hands and shoes visible, centered 3:4 composition with safe transparent margins, consistent body proportions, fixed straight-on camera and soft neutral lighting, clean polished anime game illustration, crisp line art, carefully rendered fabric details, isolated character, true transparent background with real alpha pixels, no scenery, no floor, no cast shadow, no text, no symbols, no logo
```

**成年篇 base prompt**

```text
Sorasaki Hina from Blue Archive, use the approved student sprite only as a character-identity reference, depict her as a clearly adult woman five years after graduation, contemporary mature everyday clothing suitable for a café or city walk, no school uniform or school insignia, preserve her recognizable face, pale lavender hair, red eyes, horns, halo and accessories, one full-body standing character sprite, relaxed natural pose, both hands and shoes visible, centered 3:4 composition with safe transparent margins, same approved line art, proportions, lighting and camera as the project sprite set, clean polished anime game illustration, true transparent background with real alpha pixels, no scenery, text, symbols, logo, or watermark
```

**Character consistency prompt**

```text
Use the approved base sprite as the exact identity and composition reference. Preserve face shape, hairstyle and color, eyes, horns, halo, outfit, accessories, proportions, pose, hand position, camera, character scale, framing, lighting and line art. Change only the requested facial expression. Keep all character details inside the canvas and the background truly transparent. Do not redesign, rotate, zoom, crop or reposition the character.
```

**表情修飾詞**

| 情緒 | Expression modifier |
| --- | --- |
| 普通 | `calm neutral expression, relaxed eyebrows, gentle closed mouth` |
| 微笑 | `gentle small smile, softened eyes, relaxed eyebrows` |
| 開心 | `bright cheerful smile, natural happy eyes, slightly lifted cheeks` |
| 驚訝 | `slightly widened eyes, subtly raised eyebrows, small surprised mouth` |
| 困惑 | `subtly furrowed eyebrows, questioning eyes, slight uncertain expression` |
| 擔憂 | `eyebrows gently raised inward, concerned eyes, restrained worried mouth` |
| 生氣 | `focused narrowed eyes, firm eyebrows, controlled displeased expression` |
| 害羞 | `subtle blush, shy small smile, slightly softened gaze` |
| 認真 | `focused eyes, composed brows, restrained determined expression` |
| 放鬆 | `relaxed eyes and shoulders, quiet natural smile` |
| 困倦 | `slightly heavy eyelids, tired but composed expression` |
| 好奇 | `attentive eyes, subtly lifted brows, restrained curiosity` |
| 不捨 | `soft saddened eyes, restrained expression, no exaggerated tears` |

**通用 sprite negative prompt**

```text
different character, changed face, changed hair color, missing horns, missing halo, missing accessories, inconsistent outfit, changed pose, changed camera, changed proportions, cropped head, cropped halo, cropped hands, cropped shoes, out of frame, duplicate character, multiple characters, extra limbs, extra fingers, missing fingers, malformed hands, bad anatomy, distorted eyes, white or opaque background, checkerboard pattern, scenery, floor, cast shadow, text, symbols, logo, watermark, frame, blurry, low quality
```

## 事件 CG 提示詞模板

輸出 16:9、至少 1920×1080 母檔。以劇情中的動作和情緒選擇遠景、雙人中景、近景或物件細節；人物與關鍵動作須避開底部對話區。

```text
Original event CG for the hina-galgame fan visual novel. Depict [SPECIFIC STORY MOMENT] at [LOCATION AND TIME]. Use the approved character references for identity, age, clothing and accessories. Show [CLEAR ACTION OR RELATIONSHIP CHANGE] through expressions, eye lines, gestures and scene props. Choose a [WIDE / TWO-SHOT / CLOSE-UP / DETAIL] composition appropriate to the beat, with coherent perspective, layered environment, expressive natural lighting and the project's clean anime illustration style. Keep faces and story-critical gestures clear of the lower dialogue-safe area. No text, pseudo-writing, logos, watermarks, dialogue boxes, UI, frames, or borders. Do not reproduce an existing game's CG composition or imitate a named artist.
```

**CG negative prompt**

```text
gibberish text, random glyphs, logo, watermark, subtitle, UI, dialogue box, copied composition, duplicated character, inconsistent face, inconsistent age or clothing, extra fingers, malformed hands, bad anatomy, impossible pose, inconsistent perspective, focal face obscured, important gesture hidden by bottom overlay, blurry, low resolution, compression artifacts
```

## 人工驗收

- 背景：16:9 母檔至少 1920×1080；確認透視、光源、道具、下方對話安全區，並移除不可讀假字與錯誤招牌。
- 角色：確認透明 alpha、尺寸／可見輪廓、角色辨識度、服裝年齡、光環／頭髮／手部／鞋底完整及差分一致。
- CG：確認劇情與關係狀態正確、構圖有別於其他 CG、手部／姿勢／透視可信，人物表情與關鍵動作不受 UI 遮擋。
- 在桌面 1440×900、手機直向 390×844、手機橫向 844×390 檢視；另安排 iPhone Safari 實機驗收。未通過項目留在佔位或待修狀態，不標記為已完成。
