# 角色透明 Sprite 重新生成提示詞

**目的：** 後續如需新增／重製角色 sprite，可參照此提示詞重新建立透明基礎立繪與表情差分。2026-11-23 使用者提供的 13 張表情新圖已依其指示直接接入正作；本文件的舊尺寸及生成流程不作為該批素材的阻擋條件。

## 共通生成規格

- 解析度：1104×1824，直式約 3:5。
- 每次只生成一張角色圖，不要生成拼圖或多格表情表。
- 全部使用同一模型、同一參考圖、相同畫布、相同鏡頭與盡可能一致的 seed。
- 先生成基礎立繪；確認姿勢、服裝、光環、鞋底及透明像素後，再把基礎立繪作為後續表情差分的參考。
- 所有表情只改臉部表情；頭部角度、身體姿勢、手部位置、服裝、配件、人物大小與畫面位置都必須保持一致。
- 若 PixAI 提供透明背景輸出選項，必須開啟；若沒有，生成結果不可直接當作 sprite。RGBA 格式不代表真的有透明像素，匯出後仍要檢查 alpha。

## Base Prompt（基礎立繪）

```text
Sorasaki Hina from Blue Archive, use the provided reference image for character identity and costume details, one character only, full-body standing character sprite, front-facing, centered composition, straight-on camera, calm neutral expression, pale lavender long hair, red eyes, black curved horns, floating halo fully visible above the head, Gehenna uniform matching the reference, red armband, dark cape and all recognizable accessories preserved, relaxed symmetrical standing pose, arms naturally resting at the sides, both hands fully visible, both shoes fully visible, entire halo and entire character safely inside the canvas with generous margins, consistent character proportions, clean silhouette, polished anime game character illustration, crisp line art, transparent background with real alpha transparency, isolated character only
```

## 共通 Negative Prompt

以下內容貼入每張圖的 Negative Prompt 欄位：

```text
opaque background, white background, off-white background, gray background, solid color background, gradient background, checkerboard background, room, scenery, landscape, floor, wall, cast shadow, frame, text, logo, watermark, question marks, hearts, sparkles, extra effects, extra ornaments, cropped halo, cropped horns, cropped hair, cropped hands, cropped shoes, cut off, out of frame, different pose, changed head angle, changed camera angle, different outfit, missing red armband, missing halo, missing horns, different hair color, different eye color, inconsistent character design, multiple characters, duplicate character, extra limbs, extra fingers, missing fingers, deformed hands, bad anatomy, blurry, low quality, worst quality
```

## Expression Prompts

每次只把其中一條接在 Base Prompt 後面；其他共通規格與 Negative Prompt 不變。

| 檔名 | Expression Prompt |
| --- | --- |
| hina-normal.png | `neutral, calm, composed, relaxed eyebrows, closed mouth` |
| hina-smile.png | `gentle small smile, softened eyes, relaxed eyebrows` |
| hina-happy.png | `bright happy smile, cheerful eyes, slightly raised cheeks` |
| hina-surprised.png | `surprised expression, widened eyes, raised eyebrows, mouth slightly open` |
| hina-confused.png | `confused expression, slightly drawn eyebrows, uncertain small mouth, no graphic symbols` |
| hina-worried.png | `worried expression, concerned eyes, slightly lowered eyebrows, subtle frown` |
| hina-angry.png | `angry expression, narrowed eyes, furrowed eyebrows, firm closed mouth` |
| hina-shy.png | `shy expression, subtle blush, eyes slightly lowered, small restrained smile` |

## 匯出驗收

- [ ] 9 張圖（1 張 base＋8 張表情）尺寸一致，皆為 1104×1824。
- [ ] alpha 像素不是全部 255；背景透明區域確實存在。
- [ ] 透明邊緣沒有白邊、灰邊或頭髮／光環被誤刪。
- [ ] 每張的光環、角、髮型、服裝、紅色臂章、手部與鞋底都完整。
- [ ] 8 張表情的姿勢、鏡頭、人物大小及畫面位置一致，只改臉部表情。
- [ ] 沒有把問號、文字、愛心或其他表情特效烘焙進圖像。
- [ ] 先保留原始輸出，再使用 CI 的 PNG alpha 檢查器驗證；全部通過後才更新 EMOTION_SPRITES。

**重要：** 若某次生成改變了姿勢、服裝或鏡頭，不要把它硬配成表情差分；應重新生成該張，維持同一套 sprite 的一致性。
