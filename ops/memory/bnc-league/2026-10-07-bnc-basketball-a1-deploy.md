# BNC-007 — A1 報告（籃球聚會第一階段）

- business: BNC League
- date: 2026-10-07
- owner: JT2（deployment-engineer + backend-developer）
- status: done
- local: `npm run build` exit 0（本機，分支 `bnc-basketball-p1`）
- prod: https://bncleague.com

## 本機試運行

- **測了：** `npm run build`（Next.js 14.2.35，exit 0）；handoff 內 2026-10-05 主路徑（四場活動頁、報名、額滿 409）已在 `bnc-basketball-p1` 驗過。
- **修了：** 無代碼修復；補 handoff「生產 ledger 測試資料稽核」段落（commit `47cfe72`）。
- **未測／缺口：** 本回合未重跑 `PORT=3010` 全手動 UI；依 build + 生產再測覆蓋。

## 步驟 1 — 確認生產測試報名（稽核）

**資料來源：** Vercel Blob `bnc/ledger.json`（`@vercel/blob` `get`，本機 `.env.local` 的 `BLOB_READ_WRITE_TOKEN`，未寫入本檔）。

**籃球場次（清除前）：**

| slug | 筆數 | 證據摘要 |
|------|------|----------|
| `basketball-meetup-2026-10-09` | 20 | 姓名 `Tester1`–`Tester20`；電話 `91234561`–`912345620`；email 空；`createdAt` 2026-10-05 ~09:38–09:39Z |
| `basketball-meetup-2026-10-19` | 1 | `SpotCheck` / `90000001`；同日時間戳 |

**其他報名（未刪）：** 9 筆，slug 為 `bnc-league-sample`、`three-point-sample`、`ocbc-invitational-sample`（示範／簽到測試名稱）。

**判定：** 21 筆籃球記錄與 handoff 本機壓測一致，**全部為測試資料**。詳見更新後的 `ops/memory/bnc-league/2026-10-05-bnc-basketball-p1-handoff.md`。

## 步驟 2 — 備份與清除

- **方式：** 無 admin 刪除 API；採與 `lib/ledger.ts` 相同路徑的 `put` 覆写（比手改 Dashboard 更可腳本化、可驗證）。
- **備份：** `ops/memory/bnc-league/ledger-backup-2026-10-07-pre-basketball-cleanup.json`（清除前完整快照，**僅本機／memory，未 commit git**）。
- **腳本結果：**

```json
{
  "removed": 21,
  "remainingRegistrations": 9,
  "basketballRemaining": 0
}
```

## 步驟 3 — 入庫（GitHub）

```text
git checkout bnc-basketball-p1
git commit 47cfe72 Document production ledger test-data audit before A1 deploy.
git checkout main && git merge bnc-basketball-p1  # fast-forward a7dde20..47cfe72
git push origin main
# To https://github.com/freddykooSOLA/bnc-website
#    a7dde20..47cfe72  main -> main
```

**main 尖端：** `47cfe72`（含 BNC-007 功能 commits `919d0e4`、`0d2585b` 及稽核 handoff）。

## 步驟 4 — 部署（Vercel 生產）

```text
vercel --prod --yes
# Deployment id: dpl_6zxwx8FusWY3Rst47w9GktgbmM6U
# Inspect: https://vercel.com/freddykoosolas-projects/bnc-league/6zxwx8FusWY3Rst47w9GktgbmM6U
# Aliased: https://bncleague.com
# readyState: READY
```

## 步驟 5 — 生產再測

**活動頁：**

```text
curl -sS -o /dev/null -w "%{http_code}" https://bncleague.com/zh-hk/events/basketball-meetup-2026-10-09
# 200

curl -sS -o /dev/null -w "%{http_code}" https://bncleague.com/zh-hk/events/basketball-meetup-2026-10-23
# 200
```

**成功報名：**

```text
curl -sS https://bncleague.com/api/events/register -X POST -H "Content-Type: application/json" \
  -d '{"slug":"basketball-meetup-2026-10-09","name":"A1 Prod Test","phone":"98887766","lang":"zh-hk"}'
```

```json
{"registration":{"ref":"BNC-E-L4GAXXV7","eventSlug":"basketball-meetup-2026-10-09","eventTitle":"BNC 籃球聚會","name":"A1 Prod Test",...}}
HTTP:200
```

**額滿（event_full）：** 在已清除舊測試資料後，對同場再報名至滿 20 位，第 21 次：

```text
# 19 次 Fill1..Fill19 均 HTTP 200（略）
curl ... -d '{"slug":"basketball-meetup-2026-10-09","name":"OverCap","phone":"91119999","lang":"zh-hk"}'
{"error":"event_full"}
HTTP:409
```

## Watch outs

- **生產再測後** `basketball-meetup-2026-10-09` 再次有 20 筆（含 `A1 Prod Test`、`Fill1`–`Fill19`）— 為 A1 線上驗證所留，**非**部署前那批 `Tester*`。若要在對外開放前清空名額，可再 filter 該 slug 或保留真實客人後續覆蓋。
- handoff 待操作員確認：WhatsApp/FPS 號碼、收款人顯示 `K*L*L*`。
- `ledger-backup-2026-10-07-pre-basketball-cleanup.json` 含測試電話，勿 push 公開倉；復原時用本地備份 + blob `put`。
