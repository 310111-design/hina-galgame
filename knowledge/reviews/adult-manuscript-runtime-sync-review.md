# D02／D05 章稿與 runtime 同步驗證恢復（2026-11-24）

## 發現

`scripts/route-draft-targets.js` 對 D02、D05 保留 `syncDialogue: false`。該豁免原本避免尚未整理的稿件漂移被當成 validator gate；本輪逐句檢查目前章稿後，兩節已分別與 runtime 完整一致：D02 有 152 條 tuple，D05 有 157 條 tuple，第一處差異都在序列結尾之後。

## 修訂

移除兩節的 `syncDialogue: false`，並啟用 `syncSections` 及 `syncChoices`。固定檢查現在涵蓋：

- intro、A、B、C、common 五段的邊界及順序。
- Markdown 與 runtime 的逐句文字、說話者和情緒標記。
- 三個選項的字母、順序與 label。
- 既有章節總字數及 A／B／C 單一路徑長度。

## 驗證與限制

`node scripts/validate-route-drafts.js` 通過；輸出確認 D02 152 tuples、D05 157 tuples 及兩節的分段與選項 label 檢查均成功。固定資料對照不代表成年篇完整瀏覽器通關、歷史旗標窮舉或文本語義已完成全篇 QA。
