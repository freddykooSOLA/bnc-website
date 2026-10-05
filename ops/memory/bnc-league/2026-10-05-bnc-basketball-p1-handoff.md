# BNC-007 籃球聚會（第一階段）— `bnc-basketball-p1` 交接

**分支：** `bnc-basketball-p1`（未 push）  
**票號：** BNC-007

## 改動摘要

- 在 `lib/events-catalog.ts` 新增 4 場 BNC 籃球聚會（`published` + `collectPayment`，名額 20，HK$50／位），保留原有示例活動。
- 新增 `components/EventPaymentInstructions.tsx`（FPS／Alipay 852 90944252、收款人 K*L*L*、WhatsApp 按鈕）；僅在活動詳情頁與報名成功（ticket）頁顯示。
- 報名表：電郵、隊名、球衣需求為可選；API 不再強制隊名；`needsJersey` 存入 ledger。
- 場次備註：管理員可編輯 `data/event-operator-notes.json`（正式環境亦可覆寫 `data/runtime/event-operator-notes.json`）。
- 活動列表／詳情：已發布活動不顯示 Sample 標籤；詳情顯示 19:00–21:00 時段與備註。

### 活動 slug 與場地

| 日期 | 時間 | 場地 | slug |
|------|------|------|------|
| 2026-10-09 | 19:00–21:00 | 調景嶺體育館 B 場 | `basketball-meetup-2026-10-09` |
| 2026-10-19 | 19:00–21:00 | 林士德體育館 A 場 | `basketball-meetup-2026-10-19` |
| 2026-10-23 | 19:00–21:00 | 調景嶺體育館 B 場 | `basketball-meetup-2026-10-23` |
| 2026-10-26 | 19:00–21:00 | 九龍灣體育館 B 場 | `basketball-meetup-2026-10-26` |

## Build

- `npm run build` → **exit 0**（2026-10-05，本機）

## 本機測試（`PORT=3010 npm run start`，清空 `data/runtime/ledger.json` 後）

1. **四個活動頁可開啟：** `GET /zh-hk/events/{slug}` 四個 slug 均 **HTTP 200**。
2. **名額未滿可報名：** `POST /api/events/register` → `basketball-meetup-2026-10-19`，**HTTP 200**，取得 `BNC-E-*`。
3. **第 20 位後額滿：** 對 `basketball-meetup-2026-10-09` 連續報名 21 次；第 1–20 次 **HTTP 200**，第 21 次 **HTTP 409**、`{"error":"event_full"}`。

## Commit

- **Hash：** `919d0e4a9ae3dc6232d97659daebf8d1c67f108c`
- **Message：** Add four basketball meetup events with FPS/Alipay payment instructions and capacity registration.

## 待操作員確認

1. **WhatsApp／收款號碼：** 原文「909445252」為 9 位，與香港手機格式不符；全站統一 **852 90944252**，WhatsApp **https://wa.me/85290944252**。請確認是否正確。
2. **收款人遮蓋顯示** `K*L*L*` 是否與實際 FPS／Alipay 顯示名一致。
3. **`ops/memory/hq/WORK_STANDARD_RESULT_FIRST.md`** 在本倉庫不存在；若 HQ 有更新版請 JT1 對照。
4. 本機測試後 **`basketball-meetup-2026-10-09` ledger 已有 20 筆測試報名**；上線或再測前請清空該場 `data/runtime/ledger.json` 內對應紀錄或整檔重置（視部署環境而定）。

## 刻意未做

會員系統、Google 登入、雷達圖、商城；未 push、未改 `.env`。
