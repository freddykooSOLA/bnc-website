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

export async function findDraftEntry(competitionId: string, memberId: string) {
  return prisma.teamEntry.findFirst({
    where: {
      competitionId,
      status: 'draft',
      team: { createdById: memberId },
    },
    include: {
      team: { include: { memberships: { orderBy: { jerseyNumber: 'asc' } } } },
    },
  });
}

export async function getDraftPayloadForMember(slug: string, memberId: string) {
  const competition = await ensureCompetitionRow(slug);
  if (!competition) return null;
  const draft = await findDraftEntry(competition.id, memberId);
  if (!draft) return null;
  return {
    ref: draft.ref,
    teamId: draft.teamId,
    form: {
      division: competition.category,
      bank: draft.team.bank,
      jerseyColor1: draft.team.jerseyColor1,
      jerseyColor2: draft.team.jerseyColor2,
      leaderNameZh: draft.leaderNameZh,
      leaderNameEn: draft.leaderNameEn,
      leaderIdPartial: draft.leaderIdPartial,
      leaderEmail: draft.leaderEmail,
      leaderMobile: draft.leaderMobile,
      leaderEmergency: draft.leaderEmergency,
      declarationBank: draft.declarationBank ?? '',
      declarationSigned: draft.declarationSigned ?? '',
    },
    players: draft.team.memberships.map((m, index) => ({
      number: index + 1,
      nameZh: m.nameZh,
      nameEn: m.nameEn,
      idPartial: m.idPartial,
      staffId: m.staffId ?? '',
      jerseyNumber: m.jerseyNumber,
    })),
  };
}

export async function saveTeamEntryDraft(opts: {
  slug: string;
  memberId: string;
  input: TeamEntryInput;
}): Promise<{ ref: string }> {
  const competition = await ensureCompetitionRow(opts.slug);
  if (!competition) throw new Error('competition_not_found');

  const existing = await findDraftEntry(competition.id, opts.memberId);

  const result = await prisma.$transaction(async (tx) => {
    let teamId: string;
    if (existing) {
      teamId = existing.teamId;
      const teamName = `${opts.input.bank} — ${opts.input.leaderNameEn || opts.input.leaderNameZh}`;
      await tx.team.update({
        where: { id: teamId },
        data: {
          name: teamName,
          bank: opts.input.bank,
          jerseyColor1: opts.input.jerseyColor1,
          jerseyColor2: opts.input.jerseyColor2,
        },
      });
      await tx.teamMembership.deleteMany({ where: { teamId } });
      if (opts.input.players.length > 0) {
        await tx.teamMembership.createMany({
          data: opts.input.players.map((p) => ({
            teamId,
            nameZh: p.nameZh,
            nameEn: p.nameEn,
            idPartial: p.idPartial,
            staffId: p.staffId ?? null,
            jerseyNumber: p.jerseyNumber,
            isCaptain: p.number === 1,
            status: 'listed',
          })),
        });
      }
      const entry = await tx.teamEntry.update({
        where: { id: existing.id },
        data: {
          leaderNameZh: opts.input.leaderNameZh,
          leaderNameEn: opts.input.leaderNameEn,
          leaderIdPartial: opts.input.leaderIdPartial,
          leaderEmail: opts.input.leaderEmail,
          leaderMobile: opts.input.leaderMobile,
          leaderEmergency: opts.input.leaderEmergency,
          declarationBank: opts.input.declarationBank || null,
          declarationSigned: opts.input.declarationSigned || null,
        },
      });
      return { ref: entry.ref };
    }

    const teamName = `${opts.input.bank} — ${opts.input.leaderNameEn || opts.input.leaderNameZh}`;
    const team = await tx.team.create({
      data: {
        name: teamName,
        bank: opts.input.bank,
        jerseyColor1: opts.input.jerseyColor1,
        jerseyColor2: opts.input.jerseyColor2,
        createdById: opts.memberId,
      },
    });
    teamId = team.id;
    if (opts.input.players.length > 0) {
      await tx.teamMembership.createMany({
        data: opts.input.players.map((p) => ({
          teamId,
          nameZh: p.nameZh,
          nameEn: p.nameEn,
          idPartial: p.idPartial,
          staffId: p.staffId ?? null,
          jerseyNumber: p.jerseyNumber,
          isCaptain: p.number === 1,
          status: 'listed',
        })),
      });
    }
    const entry = await tx.teamEntry.create({
      data: {
        competitionId: competition.id,
        teamId,
        leaderNameZh: opts.input.leaderNameZh,
        leaderNameEn: opts.input.leaderNameEn,
        leaderIdPartial: opts.input.leaderIdPartial,
        leaderEmail: opts.input.leaderEmail,
        leaderMobile: opts.input.leaderMobile,
        leaderEmergency: opts.input.leaderEmergency,
        declarationBank: opts.input.declarationBank || null,
        declarationSigned: opts.input.declarationSigned || null,
        status: 'draft',
      },
    });
    return { ref: entry.ref };
  });

  return result;
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

  const draft = await findDraftEntry(competition.id, opts.memberId);

  const result = await prisma.$transaction(async (tx) => {
    let teamId: string;
    let entryId: string | undefined;

    if (draft) {
      teamId = draft.teamId;
      const teamName = `${opts.input.bank} — ${opts.input.leaderNameEn || opts.input.leaderNameZh}`;
      await tx.team.update({
        where: { id: teamId },
        data: {
          name: teamName,
          bank: opts.input.bank,
          jerseyColor1: opts.input.jerseyColor1,
          jerseyColor2: opts.input.jerseyColor2,
        },
      });
      await tx.teamMembership.deleteMany({ where: { teamId } });
      if (opts.input.players.length > 0) {
        await tx.teamMembership.createMany({
          data: opts.input.players.map((p) => ({
            teamId,
            nameZh: p.nameZh,
            nameEn: p.nameEn,
            idPartial: p.idPartial,
            staffId: p.staffId ?? null,
            jerseyNumber: p.jerseyNumber,
            isCaptain: p.number === 1,
            status: 'listed',
          })),
        });
      }
      entryId = draft.id;
    } else {
      const teamName = `${opts.input.bank} — ${opts.input.leaderNameEn || opts.input.leaderNameZh}`;
      const team = await tx.team.create({
        data: {
          name: teamName,
          bank: opts.input.bank,
          jerseyColor1: opts.input.jerseyColor1,
          jerseyColor2: opts.input.jerseyColor2,
          createdById: opts.memberId,
        },
      });
      teamId = team.id;
      if (opts.input.players.length > 0) {
        await tx.teamMembership.createMany({
          data: opts.input.players.map((p) => ({
            teamId,
            nameZh: p.nameZh,
            nameEn: p.nameEn,
            idPartial: p.idPartial,
            staffId: p.staffId ?? null,
            jerseyNumber: p.jerseyNumber,
            isCaptain: p.number === 1,
            status: 'listed',
          })),
        });
      }
    }

    const entry = entryId
      ? await tx.teamEntry.update({
          where: { id: entryId },
          data: {
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
        })
      : await tx.teamEntry.create({
          data: {
            competitionId: competition.id,
            teamId,
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