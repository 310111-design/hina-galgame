# 逐句舞台特寫／退遠標記

## 使用方式

只在明確需要鏡頭距離變化的陽奈台詞上加演出標記：

```text
【陽奈｜驚訝｜特寫】你真的記得那件事？
【陽奈｜認真｜退遠】先讓大家把自己的生活排回去吧。
```

第三個分隔欄仍是角色表情；第四欄只記錄舞台 cue。產生的 runtime tuple 是 `["hina", text, mood, "close"]` 或 `["hina", text, mood, "wide"]`。未標記的舊寫法不變，預設不縮放；不從台詞字義、情緒名稱或角色表情推測演出。

## 效果與界線

- `特寫` 將立繪放大至基準比例的 1.045 倍；`退遠` 縮小至 0.97 倍，錨點維持人物下緣。
- cue 只跟隨標記的那一句；下一句、旁白、選項、結局或章節切換會清除上一個 cue。
- 作業系統選取 `prefers-reduced-motion: reduce` 時，cue 回到標準比例且不執行縮放轉場。
- 不調整原始立繪尺寸／像素、不變更對話文字、不改存檔格式。現有故事尚未加任何 cue，因此此功能接入不改變目前玩家畫面。
- 此標記只控制角色立繪的輕微距離感。事件 CG 進出場轉場需等 CG 素材與事件映射確定後另訂，不使用此欄位代替。

## 驗證

`validate-game-data.js` 限制 cue 僅可用於陽奈台詞且只接受 `close`／`wide`；`validate-route-drafts.js` 比對 Markdown 標記與 runtime tuple；`validate-stage-cue-runtime.js` 驗證一行重設、無效值回退、CSS 縮放幅度與減少動態偏好。以上不取代 viewport／iPhone Safari 的實際畫面驗收。
