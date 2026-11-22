import type { Competition } from '@/lib/competitions';
import { databaseEnabled, prisma } from '@/lib/prisma';

export function isCompetitionRegistrationOpen(competition: Competition): boolean {
  const closeAt = new Date(`${competition.registerBy}T23:59:59+08:00`);
  return Date.now() <= closeAt.getTime();
}

export async function leaderHasCompetitionEntry(
  competitionSlug: string,
  memberId: string
): Promise<boolean> {
  if (!databaseEnabled()) return false;
  const competition = await prisma.competition.findUnique({
    where: { slug: competitionSlug },
  });
  if (!competition) return false;
  const existing = await prisma.teamEntry.findFirst({
    where: {
      competitionId: competition.id,
      status: { not: 'draft' },
      team: { createdById: memberId },
    },
    select: { id: true },
  });
  return Boolean(existing);
}