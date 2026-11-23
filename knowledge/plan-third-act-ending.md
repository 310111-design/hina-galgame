# 階段紀錄：C05→C06→D01

> 本檔補充唯一總路線圖 `knowledge/plan.md`。CAT-01～06 已於 2026-11-24 修訂、同步並加入主路線圖；後續依主路線圖盤點尚未覆蓋的共通回收、分支前提、旗標回收及路線入口出口，不重做已完成審校。

## 完成項

- [x] 完整閱讀 C05／C06／D01，核對兩組交界的十八種局部分支組合及 D01 兩條條件回憶的分支依賴；人工審校紀錄見 `knowledge/reviews/third-act-ending-transitions.md`。
- [x] 修訂 CAT-01／03／04：將 C05 設為 C06 翌日，明示指定同伴完成回查並結案；C04 留下且仍待資料的舊表格交由下一位資料交接負責人依既有條件與期限續追，沒有假設所有待辦清空。
- [x] 修訂 CAT-02／05／06：補上 C05 B 返室動作；保留無日期的再見邀請和成年後偶遇，不宣稱預約赴約；在 C06 簡短留下未來可重新協商稱呼的提示。
- [x] 同步 C05／C06 章稿與 `site/game-data.js`，修正 C06 共通段的資料稱呼差異；routes 新增 C06 intro／A／B／C／common 逐句、邊界及選項核對目標。
- [x] 固定驗證成功：routes（C05／C06 145／151 tuples；D01 2,706 字元，三路 2,529／2,523／2,540）、game-data、shells、JavaScript 語法、`git diff --check`。固定檢查不涵蓋全史旗標窮舉或瀏覽器通關。
- [x] 將經驗及未來適用範圍追加至 `knowledge/experience.md`；詳情保留於 `knowledge/experience-third-act-ending.md`，CAT 結果及限制記於 `knowledge/reviews/third-act-ending-transitions.md`。
- [x] CAT 完成狀態、證據與下一步合併至唯一總路線圖 `knowledge/plan.md`。

## 保留的未完成工作

- [ ] CAT 的十八格局部矩陣不是十八次實機通關；D01 條件旗標未做全史窮舉，全篇分支 QA 仍未完成。
- [ ] iPhone Safari safe-area、動態視窗、實機觸控與完整多尺寸 QA 尚未完成。
- [ ] 本次 CAT 文件／runtime 提交後的 Actions 與 Pages 狀態須依新 run 核實；UI 2.0 commit `fd19721` 及 TMT 前一輪 run `45218114321` 已成功。

## 下一步

依 `knowledge/plan.md` 盤點尚未覆蓋的共通回收、分支前提、旗標回收及路線入口出口 QA；CAT 階段不重做，並保留 iPhone Safari、全篇 QA 與 Pages 驗收待辦。

## 試玩、驗證與提交界線

CAT 階段修改了 C05／C06 章稿與 runtime。人工十八格矩陣不是 18 次瀏覽器通關；固定 routes、game-data、shells 不能等同全史旗標已窮舉、實機操作通過或 Pages 部署成功。推送後須查相應 Actions／Pages；遠端拒絕非快轉更新時，不 force push。
