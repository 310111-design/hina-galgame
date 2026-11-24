# 陽奈正式立繪與表情差分規格

**用途：** 記錄 Galgame 角色 sprite 規格。舊有 8 張 IMG PNG 保留作視覺參考；2026-11-23 使用者另提供 13 張新表情 PNG，並指示依標題全部接入（包含替換原有 8 種表情）。原始新圖為 896×1200 RGBA 且含透明像素，保留不改；遊戲使用逐像素相同的 lossless WebP runtime 副本，若瀏覽器不支援或圖片讀取失敗則依序退回原 PNG 與 SVG。跨裝置顯示驗收仍待完成。

## 1. 輸出規格

- 尺寸：**1104×1824 px**，所有圖片完全一致。
- 格式：PNG，8-bit RGBA。
- 背景：必須是真正透明像素，不是白底、棋盤格圖案或看起來像透明的背景。
- 角色：單一全身角色，頭頂光環與雙腳都完整留在畫面內；四周保留少量透明安全邊界。
- 構圖：角色置中、固定大小、固定站姿、固定鏡頭、固定光源與線稿風格。
- 一致性：先完成基礎立繪，再以該圖作為角色參考生成各情緒；盡可能固定模型版本、seed（若可用）及參考強度。
- 透明驗收：CI 必須確認透明像素數大於 0，且 alpha 最小值小於 255；不能只看 PNG 的 color type 是 RGBA。

## 2. 基礎立繪 Prompt

建議使用英文提示詞：

```text
Sorasaki Hina from Blue Archive, faithful character design, one girl, full body standing character sprite, calm neutral expression, relaxed natural standing pose, arms resting naturally, both feet fully visible, halo fully visible above her head, centered composition, straight-on camera with a very subtle three-quarter angle, fixed camera distance, consistent body scale, pale lavender long hair, black curved horns, distinctive halo, Gehenna academy uniform, red armband and original accessories, clean high-quality anime game illustration, crisp lineart, carefully rendered fabric details, consistent colors, isolated character only, true transparent background, transparent alpha channel, no floor, no cast shadow, no scenery, no text, no logo
```

## 3. 共通角色一致性 Prompt

每張表情差分都附加這段，並使用同一張基礎立繪作角色參考：

```text
Use the provided base sprite as the exact character and composition reference. Preserve the same character identity, face shape, pale lavender hairstyle, horns, halo, uniform, red armband, accessories, body proportions, standing pose, hand position, camera angle, camera distance, character scale, framing, lighting, lineart, and color palette. Keep the entire halo and both feet inside the canvas. Change only the facial expression, eyebrows, eyes, and mouth. Do not redesign, rotate, zoom, crop, or reposition the character. Keep the background truly transparent with real alpha pixels.
```

## 4. 表情差分修飾詞

每次只替換一個表情描述，不要改動身體姿勢：

| 檔名 | Expression modifier |
| --- | --- |
| `hina-normal.png` | calm neutral expression, relaxed eyebrows, gentle closed mouth |
| `hina-smile.png` | gentle small smile, relaxed eyes, warm but restrained expression |
| `hina-happy.png` | bright cheerful smile, slightly lifted eyebrows, natural happy eyes |
| `hina-surprised.png` | slightly widened eyes, subtly raised eyebrows, small surprised mouth |
| `hina-confused.png` | subtly furrowed eyebrows, questioning eyes, slight uncertain expression |
| `hina-worried.png` | eyebrows gently raised inward, concerned eyes, restrained worried mouth |
| `hina-angry.png` | focused narrowed eyes, firm eyebrows, controlled displeased expression |
| `hina-shy.png` | subtle blush, shy small smile, slightly softened gaze |

## 5. 共通 Negative Prompt

```text
low quality, worst quality, blurry, low resolution, jpeg artifacts, bad anatomy, deformed face, asymmetrical eyes, different character, different face, different hairstyle, changed hair color, missing horns, missing halo, missing accessories, different uniform, missing red armband, changed body proportions, changed pose, changed hand position, changed camera angle, zoomed in, cropped head, cropped halo, cropped feet, out of frame, duplicate character, multiple characters, extra limbs, extra fingers, missing fingers, distorted mouth, exaggerated expression, background scenery, room, sky, landscape, floor, cast shadow, white background, checkerboard pattern, gradient backdrop, text, logo, watermark, border
```

## 6. 透明背景失敗時的處理

- 若生成介面有真正的透明背景／alpha 匯出選項，必須啟用該選項並匯出 PNG。
- 若介面只輸出不透明背景，不要把「transparent background」提示詞當作已成功；可先輸出單色純背景，再以合適的去背流程處理，最後重新匯出 RGBA PNG。
- 去背後需放大檢查髮絲、角、光環、袖口與鞋底邊緣，避免殘留底色或誤刪角色細節。
- 將圖片放入角色預覽頁檢查，並重新執行 CI 的逐像素 alpha 掃描。

## 7. 已接入素材與後續條件

目前 13 張新圖已映射至 `site/game.js` 的 `EMOTION_SPRITES`：普通、微笑、開心、害羞、生氣、困惑、擔憂、驚訝、認真、放鬆、困倦、好奇、不捨。路線台詞使用的同義情緒也映射到相應檔案。依使用者明確指示，這批圖不需等待舊版目標尺寸才接入；實機顯示 QA 仍未完成。

後續新製作的表情圖仍建議符合下列條件：

1. 同一批圖片尺寸一致，建議 1104×1824、8-bit RGBA。
2. 每張均有真實透明像素，CI 的透明像素數大於 0。
3. 所有差分姿勢、鏡頭、服裝、配件與人物比例一致。
4. 光環、頭髮、手部與雙腳完整，無不自然去背邊緣。
5. 手機直向、手機橫向與桌面版皆完成實際畫面驗收。

若新素材與規格不同，先記錄差異；依使用者決定接入後不得宣稱實機 QA 已通過。SVG 仍作為圖片載入失敗時的回退素材。
