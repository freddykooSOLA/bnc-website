import { getCompetition } from '@/lib/competitions';
import type { TeamEntryInput } from '@/lib/competition-entry-validation';
import { databaseEnabled, prisma } from '@/lib/prisma';
import { MemberRoleType } from '@prisma/client';

export async function ensureCompetitionRow(slug: string) {
  const meta = getCompetition(slug);
  if (!meta) return null;

  return prisma.competition.upsert({
    where: { slug },
    create: {
      slug,
      title: meta.title['zh-hk'],
      category: meta.category['zh-hk'],
      registerBy: new Date(`${meta.registerBy}T23:59:59+08:00`),
      rosterBy: new Date(`${meta.rosterBy}T23:59:59+08:00`),
      feeNote: meta.fee['zh-hk'],
    },
    update: {
      title: meta.title['zh-hk'],
      category: meta.category['zh-hk'],
      registerBy: new Date(`${meta.registerBy}T23:59:59+08:00`),
      rosterBy: new Date(`${meta.rosterBy}T23:59:59+08:00`),
      feeNote: meta.fee['zh-hk'],
    },
  });
}

export async function submitTeamEntry(opts: {
  slug: string;
  memberId: string;
  input: TeamEntryInput;
}): Promise<{ ref: string }> {
  const competition = await ensureCompetitionRow(opts.slug);
  if (!competition) {
    throw new Error('competition_not_found');
  }

  const teamName = `${opts.input.bank} — ${opts.input.leaderNameEn || opts.input.leaderNameZh}`;

  const result = await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: teamName,
        bank: opts.input.bank,
        jerseyColor1: opts.input.jerseyColor1,
        jerseyColor2: opts.input.jerseyColor2,
        createdById: opts.memberId,
      },
    });

    await tx.teamMembership.createMany({
      data: opts.input.players.map((p) => ({
        teamId: team.id,
        nameZh: p.nameZh,
        nameEn: p.nameEn,
        idPartial: p.idPartial,
        staffId: p.staffId ?? null,
        jerseyNumber: p.jerseyNumber,
        isCaptain: p.number === 1,
        status: 'listed',
      })),
    });

    const entry = await tx.teamEntry.create({
      data: {
        competitionId: competition.id,
        teamId: team.id,
        leaderNameZh: opts.input.leaderNameZh,
        leaderNameEn: opts.input.leaderNameEn,
        leaderIdPartial: opts.input.leaderIdPartial,
        leaderEmail: opts.input.leaderEmail,
        leaderMobile: opts.input.leaderMobile,
        leaderEmergency: opts.input.leaderEmergency,
        declarationAccepted: new Date(),
        declarationBank: opts.input.declarationBank,
        declarationSigned: opts.input.declarationSigned,
        status: 'submitted',
      },
    });

    await tx.memberRole.upsert({
      where: {
        memberId_role: { memberId: opts.memberId, role: MemberRoleType.LEADER },
      },
      create: { memberId: opts.memberId, role: MemberRoleType.LEADER },
      update: {},
    });

    return { ref: entry.ref };
  });

  return result;
}

export function competitionEntriesEnabled(): boolean {
  return databaseEnabled();
}