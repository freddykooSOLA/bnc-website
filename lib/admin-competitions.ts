import { databaseEnabled, prisma } from '@/lib/prisma';

export const ENTRY_STATUSES = ['submitted', 'paid', 'confirmed', 'rejected'] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export function adminCompetitionsEnabled(): boolean {
  return databaseEnabled();
}

export async function listCompetitionEntries() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      entries: {
        where: { status: { not: 'draft' } },
        include: {
          team: {
            include: {
              memberships: { orderBy: { jerseyNumber: 'asc' } },
              createdBy: { select: { email: true, displayName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  return competitions;
}

export async function listDraftEntries() {
  return prisma.teamEntry.findMany({
    where: { status: 'draft' },
    orderBy: { createdAt: 'desc' },
    include: {
      competition: { select: { title: true, slug: true } },
      team: {
        select: {
          bank: true,
          name: true,
          createdBy: { select: { email: true, displayName: true } },
        },
      },
    },
  });
}

export async function updateEntryStatus(entryId: string, status: EntryStatus) {
  if (!ENTRY_STATUSES.includes(status)) {
    throw new Error('invalid_status');
  }
  return prisma.teamEntry.update({
    where: { id: entryId },
    data: {
      status,
      statusUpdatedAt: new Date(),
    },
  });
}

export async function setEntryRosterUnlocked(entryId: string, rosterUnlocked: boolean) {
  return prisma.teamEntry.update({
    where: { id: entryId },
    data: { rosterUnlocked, statusUpdatedAt: new Date() },
  });
}

export function rosterDetailToCsv(
  competitionTitle: string,
  entries: Awaited<ReturnType<typeof listCompetitionEntries>>[0]['entries']
): string {
  const header = [
    '比賽',
    '球隊',
    '球衣號碼',
    '中文姓名',
    '英文姓名',
    '有相片',
  ];
  const rows: string[][] = [];
  for (const e of entries) {
    for (const m of e.team.memberships) {
      rows.push([
        competitionTitle,
        e.team.name,
        String(m.jerseyNumber),
        m.nameZh,
        m.nameEn,
        m.photoUrl ? '是' : '否',
      ]);
    }
  }
  const lines = [header, ...rows].map((cols) =>
    cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
  );
  return '\uFEFF' + lines.join('\r\n');
}

export function entriesToCsv(
  competitionTitle: string,
  entries: Awaited<ReturnType<typeof listCompetitionEntries>>[0]['entries']
): string {
  const header = [
    '比賽',
    '參考編號',
    '球隊',
    '銀行',
    '領隊（中）',
    '領隊（英）',
    '人數',
    '狀態',
    '提交時間',
    '狀態更新',
  ];
  const rows = entries.map((e) => [
    competitionTitle,
    e.ref,
    e.team.name,
    e.team.bank,
    e.leaderNameZh,
    e.leaderNameEn,
    String(e.team.memberships.length),
    e.status,
    e.createdAt.toISOString(),
    e.statusUpdatedAt?.toISOString() ?? '',
  ]);
  const lines = [header, ...rows].map((cols) =>
    cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
  );
  return '\uFEFF' + lines.join('\r\n');
}