import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import type { PlayerSeasonStats } from '@/types';
import { databaseEnabled, prisma } from '@/lib/prisma';

export function playerLinksEnabled(): boolean {
  return databaseEnabled();
}

export function listLeaguesForLinking() {
  const config = getConfig();
  return [...config.matches.leagues, ...config.matches.archiveLeagues].map((l) => ({
    id: l.id,
    label: `${l.league} — ${l.season}`,
    url: l.url,
  }));
}

export async function searchScorelabPlayers(leagueId: string, query: string) {
  const config = getConfig();
  const league = [...config.matches.leagues, ...config.matches.archiveLeagues].find(
    (l) => l.id === leagueId
  );
  if (!league) return [];
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const data = await getCachedSeasonData(league.url);
  const stats = data.playerStats ?? {};
  return Object.values(stats)
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 25)
    .map((p) => ({
      playerId: p.playerId,
      name: p.name,
      teamName: p.teamName,
      gamesPlayed: p.gamesPlayed,
    }));
}

export async function createPlayerLink(memberId: string, leagueId: string, playerId: string) {
  const config = getConfig();
  const league = [...config.matches.leagues, ...config.matches.archiveLeagues].find(
    (l) => l.id === leagueId
  );
  if (!league) throw new Error('league_not_found');

  const data = await getCachedSeasonData(league.url);
  const player = data.playerStats?.[playerId];
  if (!player) throw new Error('player_not_found');

  return prisma.playerLink.upsert({
    where: {
      memberId_leagueId_playerId: { memberId, leagueId, playerId },
    },
    create: {
      memberId,
      leagueId,
      playerId,
      status: 'pending',
    },
    update: {
      status: 'pending',
    },
  });
}

export async function listMemberPlayerLinks(memberId: string) {
  return prisma.playerLink.findMany({
    where: { memberId },
    orderBy: { id: 'desc' },
  });
}

export async function listPendingPlayerLinks() {
  return prisma.playerLink.findMany({
    orderBy: { id: 'desc' },
    include: {
      member: { select: { email: true, displayName: true } },
    },
  });
}

export async function setPlayerLinkStatus(linkId: string, status: 'approved' | 'rejected') {
  if (status === 'approved') {
    const link = await prisma.playerLink.findUnique({ where: { id: linkId } });
    if (!link) throw new Error('not_found');

    const conflict = await prisma.playerLink.findFirst({
      where: {
        leagueId: link.leagueId,
        playerId: link.playerId,
        status: 'approved',
        NOT: { id: linkId },
      },
    });
    if (conflict) throw new Error('player_taken');
  }

  return prisma.playerLink.update({
    where: { id: linkId },
    data: { status },
  });
}

export async function loadApprovedPlayerStats(memberId: string): Promise<
  Array<{
    leagueId: string;
    leagueLabel: string;
    player: PlayerSeasonStats;
  }>
> {
  const links = await prisma.playerLink.findMany({
    where: { memberId, status: 'approved' },
  });
  const config = getConfig();
  const allLeagues = [...config.matches.leagues, ...config.matches.archiveLeagues];
  const results: Array<{
    leagueId: string;
    leagueLabel: string;
    player: PlayerSeasonStats;
  }> = [];

  for (const link of links) {
    const league = allLeagues.find((l) => l.id === link.leagueId);
    if (!league) continue;
    try {
      const data = await getCachedSeasonData(league.url);
      const player = data.playerStats?.[link.playerId];
      if (!player) continue;
      results.push({
        leagueId: link.leagueId,
        leagueLabel: `${league.league} — ${league.season}`,
        player,
      });
    } catch {
      /* skip league fetch errors */
    }
  }

  return results;
}