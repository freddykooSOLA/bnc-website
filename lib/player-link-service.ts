import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { loadPlayerSeasonFromDb, searchScorelabPlayersInDb } from '@/lib/scorelab-db';
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

export type PlayerSearchHit = {
  leagueId: string;
  leagueLabel: string;
  playerId: string;
  name: string;
  teamName: string;
  number?: string;
  image?: string;
  gamesPlayed: number;
};

export async function searchScorelabPlayersAllLeagues(query: string): Promise<PlayerSearchHit[]> {
  const q = query.trim();
  if (q.length < 1) return [];

  const dbHits = await searchScorelabPlayersInDb(q);
  if (dbHits.length > 0) return dbHits;

  const config = getConfig();
  const all = [...config.matches.leagues, ...config.matches.archiveLeagues];
  const lower = q.toLowerCase();
  const hits: PlayerSearchHit[] = [];

  for (const league of all) {
    try {
      const data = await getCachedSeasonData(league.url);
      const stats = data.playerStats ?? {};
      for (const p of Object.values(stats)) {
        if (!p.name.toLowerCase().includes(lower)) continue;
        hits.push({
          leagueId: league.id,
          leagueLabel: `${league.league} — ${league.season}`,
          playerId: p.playerId,
          name: p.name,
          teamName: p.teamName,
          number: p.number != null ? String(p.number) : undefined,
          gamesPlayed: p.gamesPlayed,
        });
        if (hits.length >= 40) return hits;
      }
    } catch {
      /* skip league */
    }
  }
  return hits;
}

/** @deprecated single-league fallback */
export async function searchScorelabPlayers(leagueId: string, query: string) {
  const all = await searchScorelabPlayersAllLeagues(query);
  return all
    .filter((p) => !leagueId || p.leagueId === leagueId)
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

    const fromDb = await loadPlayerSeasonFromDb(link.leagueId, link.playerId);
    if (fromDb) {
      results.push({
        leagueId: link.leagueId,
        leagueLabel: `${league.league} — ${league.season}`,
        player: fromDb,
      });
      continue;
    }

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

export type RelatedLeagueAppearance = {
  leagueId: string;
  leagueSeason: string;
  playerId: string;
  playerName: string;
  teamName: string;
};

export async function listRelatedApprovedPlayerLinks(
  leagueId: string,
  playerId: string
): Promise<RelatedLeagueAppearance[]> {
  const approved = await prisma.playerLink.findFirst({
    where: { leagueId, playerId, status: 'approved' },
  });
  if (!approved) return [];

  const siblings = await prisma.playerLink.findMany({
    where: {
      memberId: approved.memberId,
      status: 'approved',
      NOT: { leagueId, playerId },
    },
  });
  if (siblings.length === 0) return [];

  const config = getConfig();
  const allLeagues = [...config.matches.leagues, ...config.matches.archiveLeagues];
  const out: RelatedLeagueAppearance[] = [];

  for (const link of siblings) {
    const league = allLeagues.find((l) => l.id === link.leagueId);
    if (!league) continue;

    const fromDb = await prisma.scoreLabPlayer.findUnique({
      where: {
        leagueId_scorelabId: { leagueId: link.leagueId, scorelabId: link.playerId },
      },
    });
    if (fromDb) {
      const team = await prisma.scoreLabTeam.findUnique({
        where: {
          leagueId_scorelabId: {
            leagueId: link.leagueId,
            scorelabId: fromDb.teamScorelabId,
          },
        },
      });
      out.push({
        leagueId: link.leagueId,
        leagueSeason: league.season,
        playerId: link.playerId,
        playerName: fromDb.name,
        teamName: team?.name ?? '',
      });
      continue;
    }

    try {
      const data = await getCachedSeasonData(league.url);
      const player = data.playerStats?.[link.playerId];
      if (!player) continue;
      out.push({
        leagueId: link.leagueId,
        leagueSeason: league.season,
        playerId: link.playerId,
        playerName: player.name,
        teamName: player.teamName,
      });
    } catch {
      /* skip */
    }
  }

  return out;
}