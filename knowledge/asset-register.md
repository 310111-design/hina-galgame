# 視覺素材清冊

素材依情境製作；每項完成後記錄檔案路徑、用途、prompt 及版本。初期以可重用的背景和立繪為主，避免過早製作缺少上下文的事件圖。

| ID | 素材 | 狀態 | 規格與用途 | 建議路徑 |
| --- | --- | --- | --- | --- |
| BG-001 | 風紀委員會辦公室・黃昏 | 已生成初稿，待入 repo | 1672×941 橫向背景；金紅夕光、百葉窗影、文件堆、寬桌與暖飲，無人物與文字。初稿需再確認前景角色疊加空間後正式採用。 | `site/assets/backgrounds/prefect-office-evening-v01.png` |
| BG-002 | 格黑娜校舍屋頂・黃昏 | 待章節確認 | 作為初始 C 分支的候選背景；需先確認實際正文是否保留屋頂事件。 | `assets/backgrounds/gehenna-rooftop-evening-v01.png` |
| SPR-001 | 空崎陽奈基礎立繪與表情 | 情緒替換介面已建立 | 情緒圖檔預期直接放入 `site/assets/hina/`，不改動原圖內容；目前檔案尚未進入 repo，缺圖時回退 `site/assets/hina-sprite.svg`。 | `site/assets/hina/`、`site/assets/hina-sprite.svg` |
| CG-001 | 開場熱飲事件 CG | 待正文確認 | 只在場景構圖與角色狀態確定後製作，避免與立繪需求重複。 | `assets/cg/opening-hot-drink-v01.png` |

## 風格基準（暫定）

- **用途：** 傳統 Galgame 場景底圖，16:9 橫向構圖，能與前景 sprite 分層。
- **畫風：** 乾淨的動畫背景插畫，不仿照指定在世藝術家；溫暖夕照、柔和陰影、細緻室內材質。
- **色彩：** 金紅夕光搭配暗紫／木色陰影，明暗柔和，室內仍可閱讀。
- **排除：** 不含人物、文字、標誌、浮水印、對話框和遊戲 UI；不要把原作角色直接畫進背景。

> 工具提醒：目前無內建生圖工具，依 `knowledge/decision.md` D-03 暫以 prompt brief 管理，不切換 CLI/API。
