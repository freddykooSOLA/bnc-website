import { databaseEnabled, prisma } from '@/lib/prisma';
import type { MemberRoleType } from '@prisma/client';

export interface AccountTeamSummary {
  teamId: string;
  teamName: string;
  bank: string;
  logoUrl?: string | null;
  entryRef?: string;
  entryStatus?: string;
  competitionSlug?: string;
  competitionTitle?: string;
  isLeader: boolean;
}

export interface MemberAccountSnapshot {
  roles: MemberRoleType[];
  leaderTeams: AccountTeamSummary[];
  playerTeams: AccountTeamSummary[];
  entries: { ref: string; status: string; competitionTitle: string; slug: string }[];
}

export async function loadMemberAccount(memberId: string): Promise<MemberAccountSnapshot | null> {
  if (!databaseEnabled()) return null;

  const [roles, createdTeams, memberships, entries] = await Promise.all([
    prisma.memberRole.findMany({ where: { memberId } }),
    prisma.team.findMany({
      where: { createdById: memberId },
      include: {
        entries: { include: { competition: true } },
      },
    }),
    prisma.teamMembership.findMany({
      where: { memberId },
      include: {
        team: {
          include: {
            entries: { include: { competition: true } },
          },
        },
      },
    }),
    prisma.teamEntry.findMany({
      where: { team: { createdById: memberId }, status: { not: 'draft' } },
      include: { competition: true, team: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const leaderTeams: AccountTeamSummary[] = createdTeams.map((team) => {
    const entry = team.entries[0];
    return {
      teamId: team.id,
      teamName: team.name,
      bank: team.bank,
      logoUrl: team.logoUrl,
      entryRef: entry?.ref,
      entryStatus: entry?.status,
      competitionSlug: entry?.competition.slug,
      competitionTitle: entry?.competition.title,
      isLeader: true,
    };
  });

  const playerTeams: AccountTeamSummary[] = memberships
    .filter((m) => m.status === 'joined')
    .map((m) => {
      const entry = m.team.entries[0];
      return {
        teamId: m.team.id,
        teamName: m.team.name,
        bank: m.team.bank,
        logoUrl: m.team.logoUrl,
        entryRef: entry?.ref,
        entryStatus: entry?.status,
        competitionSlug: entry?.competition.slug,
        competitionTitle: entry?.competition.title,
        isLeader: false,
      };
    });

  return {
    roles: roles.map((r) => r.role),
    leaderTeams,
    playerTeams,
    entries: entries.map((e) => ({
      ref: e.ref,
      status: e.status,
      competitionTitle: e.competition.title,
      slug: e.competition.slug,
    })),
  };
}

export const ROLE_LABEL: Record<
  MemberRoleType,
  Record<'zh-hk' | 'zh-cn' | 'en', string>
> = {
  FAN: { 'zh-hk': '粉絲', 'zh-cn': '粉丝', en: 'Fan' },
  PLAYER: { 'zh-hk': '球員', 'zh-cn': '球员', en: 'Player' },
  LEADER: { 'zh-hk': '領隊', 'zh-cn': '领队', en: 'Team leader' },
};