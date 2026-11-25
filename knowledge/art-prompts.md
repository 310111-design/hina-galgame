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

### 18 張 CG 的分鏡補充提示

以下是待生成素材的場景級提示片段，應接在上方通用模板的 `[SPECIFIC STORY MOMENT]`、鏡頭與光線位置。這些片段只固定章節可證實的動作與構圖，不等於素材已生成或驗收。分支共通圖避免畫出只出現在某個選項的動作；成人篇使用經核准的成年陽奈參考，不以校服圖推測成人服裝。

| CG | 章節與鏡頭要求 | Prompt addendum (append to the template) |
| --- | --- | --- |
| CG-01 | P01 黃昏辦公室；桌面近中景，熱飲在畫面中心，陽奈疲倦但警覺。訪客只以畫外手臂／遞杯手表現。 | `At dusk in the student-era committee office, show tired Hina accepting a warm drink offered across a desk crowded with orderly papers. Use a close medium two-plane composition: the cup and hands in the foreground, Hina's wary, sleepy expression clearly visible behind them. Warm sunset stripes through blinds; this is a restrained first act of care, not a romantic pose.` |
| CG-02 | B02 首次交接；稍高角度的寬景，呈現資料流向與陽奈保有最後判斷。其他協作者不具名、不做可識別原作角色。 | `Show Hina guiding two generic student helpers through a first document handoff at a long table. A slightly elevated wide composition should make separate paper stacks and the clear handoff path readable, while Hina remains the one making final decisions. Use unnamed, non-distinct background classmates only; warm office light, no readable marks on papers.` |
| CG-03 | B08 自主休息；室內建立鏡頭，手機螢幕朝下、文件未動，留白表現她自己保留的十分鐘。 | `In the quiet committee office at fading sunset, show Hina alone after choosing a ten-minute break: her phone lies face-down, work papers remain untouched, and she sits back with a small exhale. Use a wide establishing view with generous negative space and a calm window glow. Do not show a specific branch activity or readable text on the note or phone.` |
| CG-04 | C06 校園最後一天；走廊遠端三分之二側面，陽奈看向逐漸變暗的校園，提出將來再見。訪客維持畫外視角。 | `On the final school-day afternoon, place student-era Hina at the far end of a familiar corridor, looking through the windows toward the dimming campus as she asks to meet again over a warm drink. Frame from the visitor's point of view, with the visitor kept off-screen. Let the distant bell and fading gold light carry a grateful, uncertain goodbye; do not imply a school-era romance.` |
| CG-05 | D01 雨後車站旁咖啡店；成人篇雙人中景，陽奈在窗邊先認出訪客，雨傘與水痕提示雨停。 | `Five years after graduation, show adult Hina noticing the visitor at the entrance of a small station-side café. Use a balanced medium two-shot with a rain-bright window, a folded umbrella and warm interior light against the cooler street outside. Keep her expression surprised but composed, with no school uniform or old authority dynamic.` |
| CG-06 | D06 關係方向選擇；平衡雙人鏡頭，闔上的工作筆記與兩杯飲料；畫面不預示任何路線。 | `At an adult café table, show Hina asking how the two of them would like to relate from now on. Use an even, eye-level two-shot with two drinks and her closed work notebook; keep respectful open space between them. The image must remain neutral before the player's choice: no route symbols, romantic touch, teamwork props, or visual path split.` |
| CG-07 | D08F 書店咖啡館；靠窗閱讀桌近中景，兩人各有一本書，陽奈傾聽對方分享。 | `In an independent bookstore café, show adult Hina and her friend seated by a window with separate books open between them. Hina listens with a small, relaxed smile and asks what the other person liked; include wood shelves and a simple cloth bag with one thin book. Keep their posture casual and clearly platonic; all covers and pages blank or unreadable.` |
| CG-08 | D08F 街邊雜貨店；午後散步的寬中景，陽奈停下看門口的手作卡片，手提薄書紙袋。 | `During a slow weekend walk, show adult Hina pausing outside a tiny neighborhood goods shop to look at handmade cards by the doorway. Use a wide street-level composition with her thin book bag, warm afternoon light and a few passersby kept soft in the background. No legible storefront lettering, no purchase, and no urgent destination.` |
| CG-09 | D08F 小廣場長椅；側面環境鏡頭，兩人安靜並坐，書袋放在長椅另一側。 | `At a small community plaza, show Hina and her friend sitting quietly on a bench after sharing their day. Compose them in profile with a thin book bag set on the far side of the bench, moving tree shadows and distant everyday passersby. Let the comfortable silence read as friendship and personal space, not a dramatic confession.` |
| CG-10 | D08F 車站道別；陽奈自然揮手，朋友以畫外肩線或遠處背影回應，光線由午後轉傍晚。 | `At the station entrance after an unhurried afternoon together, show adult Hina offering a natural goodbye wave with a relaxed smile. Use a medium-wide view from her friend's side, with station glass and ordinary commuters behind her. Keep a friendly, comfortable distance; no embrace, urgency, or implied promise of a fixed next date.` |
| CG-11 | D08P 社區圖書館戶外庭院；活動開始前核對場地與交接，兩位成年人平等討論。 | `Before a small community reading event, show adult Hina and her collaborator checking the library courtyard layout and a simple handoff sheet near the entrance. Use a three-quarter wide shot that includes garden seating, a blank directional sign and two people sharing the plan as equals. Keep documents free of readable writing and avoid assigning identifiable roles to unnamed volunteers.` |
| CG-12 | D08P 活動準備；雙人中景／手部細節，整理書籍、入口指引和共讀桌，參加者不露正臉。 | `Show adult Hina and her collaborator preparing the courtyard reading activity: arranging books by theme, setting an entrance card and leaving room around the shared-reading table. Use a layered medium shot with their hands and the layout in focus. Any attendees or volunteers should be distant or shown from behind, respecting the story's choice not to photograph participants' faces.` |
| CG-13 | D08P 收拾後；長椅近中景，兩人看活動紀錄，情緒先放鬆再討論保留項目。 | `After the courtyard has been restored and supplies handed back, show Hina and her collaborator seated on a side bench reviewing a small activity log. Use a calm medium two-shot with empty tables and returned book boxes behind them; Hina listens before evaluating details. Notes must be blank or unreadable, and the mood should be earned relief rather than celebration.` |
| CG-14 | D08P 日落收束；庭院與長桌的遠中景，陽奈闔上筆記本，提出未來有合適計畫再邀請。 | `At sunset after the reading event, show adult Hina closing her notebook beside a cleared courtyard table and thanking her collaborator. Frame the two figures against the quiet library garden, with warm low sunlight and the event materials already handed over. Convey an open invitation to work together again, not a project already promised or scheduled.` |
| CG-15 | D08R 咖啡店坦白心意；成人陽奈在窗邊雙手捧杯，說話前後與對方對視，結果尚未決定。 | `In a familiar station-side café at evening, show adult Hina speaking honestly about her romantic feelings across a small table. Her hands rest around a cup, steam softens the window lights, and her expression is sincere but not demanding. Capture the moment before the other person's answer: no ring, kiss, or assumption that the relationship is already official.` |
| CG-16 | D08R 關係界線；安靜雙人中景，手機收起、杯子各自放置，表現彼此傾聽與保留空間。 | `Show two adults calmly discussing how to respect each other's time and boundaries at the café table, with their phones put away and two cups set separately. Use an eye-level medium shot, open posture and comfortable space between them. Keep the image valid whether dating begins now or later; no ring, handholding, kiss, or possessive gesture.` |
| CG-17 | D08R 分享生活興趣；傍晚街道側向跟拍，交談者輪流聆聽，車站方向在遠處。 | `As they walk toward the station at dusk, show adult Hina and her companion exchanging stories about different hobbies. Use a side-on walking composition with warm shop lights and a softly visible station in the distance; let one gesture while the other listens. Their interests need not match, and they should walk as equals without holding hands.` |
| CG-18 | D08R 車站入口道別；兩人各自確認回家方向後揮手，玻璃門映著站內燈光。 | `At the station entrance, show adult Hina and her companion checking that each knows their way home, then exchanging a gentle wave before turning toward separate directions. Use a wide evening composition with light reflected in the glass doors and ordinary commuters passing through. Keep the farewell caring but unhurried, with no kiss, embrace, or demand for an immediate arrival message.` |

**套用與驗收：** 每張生成前核對對應章節與最新分支；如劇情修訂改變動作，先修正這一列。CG-06、CG-15、CG-16、CG-18 特別要求路線／關係狀態中性；CG-02、CG-11、CG-12 不得把未命名背景角色畫成可辨識的原作角色。共通 negative prompt、解析度、對話安全區與人工驗收條件仍適用。

**CG negative prompt**

```text
gibberish text, random glyphs, logo, watermark, subtitle, UI, dialogue box, copied composition, duplicated character, inconsistent face, inconsistent age or clothing, extra fingers, malformed hands, bad anatomy, impossible pose, inconsistent perspective, focal face obscured, important gesture hidden by bottom overlay, blurry, low resolution, compression artifacts
```

## 人工驗收

- 背景：16:9 母檔至少 1920×1080；確認透視、光源、道具、下方對話安全區，並移除不可讀假字與錯誤招牌。
- 角色：確認透明 alpha、尺寸／可見輪廓、角色辨識度、服裝年齡、光環／頭髮／手部／鞋底完整及差分一致。
- CG：確認劇情與關係狀態正確、構圖有別於其他 CG、手部／姿勢／透視可信，人物表情與關鍵動作不受 UI 遮擋。
- 在桌面 1440×900、手機直向 390×844、手機橫向 844×390 檢視；另安排 iPhone Safari 實機驗收。未通過項目留在佔位或待修狀態，不標記為已完成。
