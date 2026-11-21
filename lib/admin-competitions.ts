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