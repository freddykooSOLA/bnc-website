import type { PlayerSeasonStats } from '@/types';
import { getConfig } from '@/lib/config';
import { databaseEnabled, prisma } from '@/lib/prisma';

export type DbPlayerSearchHit = {
  leagueId: string;
  leagueLabel: string;
  playerId: string;
  name: string;
  teamName: string;
  number?: string;
  image?: string;
  gamesPlayed: number;
};

function leagueLabel(leagueId: string): string {
  const config = getConfig();
  const league = [...config.matches.leagues, ...config.matches.archiveLeagues].find(
    (l) => l.id === leagueId
  );
  return league ? `${league.league} — ${league.season}` : leagueId;
}

export async function searchScorelabPlayersInDb(query: string): Promise<DbPlayerSearchHit[]> {
  if (!databaseEnabled()) return [];
  const q = query.trim();
  if (q.length < 1) return [];

  const rows = await prisma.scoreLabPlayer.findMany({
    where: {
      active: true,
      name: { contains: q, mode: 'insensitive' },
    },
    take: 40,
    orderBy: { name: 'asc' },
  });

  if (rows.length === 0) return [];

  const teamKeys = Array.from(new Set(rows.map((r) => `${r.leagueId}\0${r.teamScorelabId}`)));
  const teams = await prisma.scoreLabTeam.findMany({
    where: {
      OR: teamKeys.map((key) => {
        const [leagueId, scorelabId] = key.split('\0');
        return { leagueId, scorelabId };
      }),
    },
  });
  const teamNameByKey = new Map(
    teams.map((t) => [`${t.leagueId}\0${t.scorelabId}`, t.name] as const)
  );

  const seasonRows = await prisma.scoreLabPlayerSeason.findMany({
    where: {
      OR: rows.map((r) => ({
        leagueId: r.leagueId,
        playerScorelabId: r.scorelabId,
      })),
    },
  });
  const gpByKey = new Map(
    seasonRows.map((s) => [`${s.leagueId}\0${s.playerScorelabId}`, s.gamesPlayed] as const)
  );

  return rows.map((r) => ({
    leagueId: r.leagueId,
    leagueLabel: leagueLabel(r.leagueId),
    playerId: r.scorelabId,
    name: r.name,
    teamName: teamNameByKey.get(`${r.leagueId}\0${r.teamScorelabId}`) ?? '',
    number: r.number ?? undefined,
    image: r.image ?? undefined,
    gamesPlayed: gpByKey.get(`${r.leagueId}\0${r.scorelabId}`) ?? 0,
  }));
}

export function dbPlayerSeasonToStats(
  season: {
    playerScorelabId: string;
    gamesPlayed: number;
    PTS: number;
    REB: number;
    AST: number;
    STL: number;
    BLK: number;
    threePM: number;
    efficiency: number;
  },
  player: {
    scorelabId: string;
    name: string;
    number?: string | null;
    teamScorelabId: string;
  },
  teamName: string
): PlayerSeasonStats {
  return {
    playerId: season.playerScorelabId,
    name: player.name,
    number: player.number ?? undefined,
    teamId: player.teamScorelabId,
    teamName,
    gamesPlayed: season.gamesPlayed,
    PTS: season.PTS,
    REB: season.REB,
    AST: season.AST,
    STL: season.STL,
    BLK: season.BLK,
    '3PM': season.threePM,
    efficiency: season.efficiency,
  };
}

export async function loadPlayerSeasonFromDb(
  leagueId: string,
  playerId: string
): Promise<PlayerSeasonStats | null> {
  if (!databaseEnabled()) return null;
  const config = getConfig();
  const league = [...config.matches.leagues, ...config.matches.archiveLeagues].find(
    (l) => l.id === leagueId
  );
  if (!league) return null;

  const player = await prisma.scoreLabPlayer.findUnique({
    where: { leagueId_scorelabId: { leagueId, scorelabId: playerId } },
  });
  if (!player) return null;

  const season = await prisma.scoreLabPlayerSeason.findFirst({
    where: { leagueId, playerScorelabId: playerId },
    orderBy: { syncedAt: 'desc' },
  });
  if (!season) return null;

  const team = await prisma.scoreLabTeam.findUnique({
    where: {
      leagueId_scorelabId: { leagueId, scorelabId: player.teamScorelabId },
    },
  });

  return dbPlayerSeasonToStats(season, player, team?.name ?? '');
}

export async function loadLeaguePlayerStatsFromDb(
  leagueId: string
): Promise<Record<string, PlayerSeasonStats> | null> {
  if (!databaseEnabled()) return null;

  const seasons = await prisma.scoreLabPlayerSeason.findMany({
    where: { leagueId },
  });
  if (seasons.length === 0) return null;

  const playerIds = Array.from(new Set(seasons.map((s) => s.playerScorelabId)));
  const players = await prisma.scoreLabPlayer.findMany({
    where: {
      leagueId,
      scorelabId: { in: playerIds },
    },
  });
  const playerById = new Map(players.map((p) => [p.scorelabId, p]));

  const teamIds = Array.from(new Set(players.map((p) => p.teamScorelabId)));
  const teams = await prisma.scoreLabTeam.findMany({
    where: { leagueId, scorelabId: { in: teamIds } },
  });
  const teamNameById = new Map(teams.map((t) => [t.scorelabId, t.name]));

  const out: Record<string, PlayerSeasonStats> = {};
  for (const season of seasons) {
    const player = playerById.get(season.playerScorelabId);
    if (!player) continue;
    const teamName = teamNameById.get(player.teamScorelabId) ?? '';
    out[season.playerScorelabId] = dbPlayerSeasonToStats(season, player, teamName);
  }
  return Object.keys(out).length ? out : null;
}