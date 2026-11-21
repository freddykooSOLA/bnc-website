import * as cheerio from 'cheerio';
import { getConfig } from '@/lib/config';
import { fetchSeasonData } from '@/lib/scorelab';
import { prisma } from '@/lib/prisma';

const SCORELAB_BASE =
  process.env.NEXT_PUBLIC_SCORELAB_BASE_URL || 'https://www.scorelab.tech';

const REQUEST_GAP_MS = 500;

export type ScorelabSyncError = { leagueId?: string; teamId?: string; message: string };

export type LeagueSyncCounts = {
  teams: number;
  players: number;
  playerSeasons: number;
};

export type ScorelabSyncResult = {
  ok: boolean;
  teams: number;
  players: number;
  playerSeasons: number;
  perLeague: Record<string, LeagueSyncCounts>;
  errors: ScorelabSyncError[];
};

type TeamMeta = {
  scorelabId: string;
  slug: string;
  name: string;
  image?: string;
  wins: number;
  losses: number;
  draws: number;
};

type RosterPlayer = {
  scorelabId: string;
  name: string;
  number?: string;
  image?: string;
  former: boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url: string, attempt = 0): Promise<string> {
  const bust = new URL(url);
  bust.searchParams.set('_', String(Date.now()));
  const response = await fetch(bust.toString(), {
    headers: {
      'User-Agent': 'BNC-League-Website/1.0',
      Accept: 'text/html',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    if (attempt < 2) {
      await sleep(REQUEST_GAP_MS);
      return fetchHtml(url, attempt + 1);
    }
    throw new Error(`ScoreLab HTTP ${response.status}`);
  }
  return response.text();
}

function parseNextJson(html: string): Record<string, unknown> | null {
  const $ = cheerio.load(html);
  const scriptContent = $('#__NEXT_DATA__').html();
  if (!scriptContent) return null;
  try {
    return JSON.parse(scriptContent) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function fetchSeasonTeamMeta(seasonUrl: string): Promise<{
  leagueSlug: string;
  seasonId: string;
  teams: TeamMeta[];
}> {
  const html = await fetchHtml(seasonUrl);
  const data = parseNextJson(html);
  if (!data) throw new Error('season_next_data_missing');
  const pageProps = (data?.props as { pageProps?: Record<string, unknown> })?.pageProps;
  const seasonData = pageProps?.seasonData as Record<string, unknown> | undefined;
  if (!seasonData) throw new Error('season_data_missing');

  const league =
    (pageProps?.league as { slug?: string } | undefined) ??
    (seasonData.leagueDetails as { slug?: string } | undefined);
  const leagueSlug = league?.slug;
  if (!leagueSlug) throw new Error('league_slug_missing');

  const seasonId = String(seasonData._id ?? '');
  const rawTeams = (seasonData.teams as Array<Record<string, unknown>> | undefined) ?? [];
  const teams: TeamMeta[] = rawTeams.map((t) => ({
    scorelabId: String(t._id ?? ''),
    slug: String(t.slug ?? t._id ?? ''),
    name: String(t.name ?? ''),
    image: typeof t.image === 'string' ? t.image : undefined,
    wins: Number((t.record as { wins?: number } | undefined)?.wins ?? 0),
    losses: Number((t.record as { losses?: number } | undefined)?.losses ?? 0),
    draws: Number((t.record as { draws?: number } | undefined)?.draws ?? 0),
  }));

  return { leagueSlug, seasonId, teams };
}

async function fetchTeamRoster(
  leagueSlug: string,
  teamSlug: string
): Promise<RosterPlayer[]> {
  const url = `${SCORELAB_BASE}/${leagueSlug}/team/${teamSlug}`;
  const html = await fetchHtml(url);
  const data = parseNextJson(html);
  const pageProps = (data?.props as { pageProps?: Record<string, unknown> })?.pageProps;
  const team = pageProps?.initialTeamData as Record<string, unknown> | undefined;
  if (!team) throw new Error('team_data_missing');

  const active = (team.players as Array<Record<string, unknown>> | undefined) ?? [];
  const former = (team.formerPlayers as Array<Record<string, unknown>> | undefined) ?? [];

  const roster: RosterPlayer[] = [];
  for (const p of active) {
    roster.push({
      scorelabId: String(p._id ?? ''),
      name: String(p.name ?? ''),
      number: p.number != null ? String(p.number) : undefined,
      image: typeof p.image === 'string' && p.image ? p.image : undefined,
      former: false,
    });
  }
  for (const p of former) {
    roster.push({
      scorelabId: String(p._id ?? ''),
      name: String(p.name ?? ''),
      number: p.number != null ? String(p.number) : undefined,
      image: typeof p.image === 'string' && p.image ? p.image : undefined,
      former: true,
    });
  }
  return roster;
}

async function upsertTeam(
  leagueId: string,
  leagueSlug: string,
  team: TeamMeta,
  syncedAt: Date,
  dryRun: boolean
) {
  if (dryRun) return;
  await prisma.scoreLabTeam.upsert({
    where: { leagueId_scorelabId: { leagueId, scorelabId: team.scorelabId } },
    create: {
      scorelabId: team.scorelabId,
      leagueId,
      leagueSlug,
      slug: team.slug,
      name: team.name,
      image: team.image,
      wins: team.wins,
      losses: team.losses,
      draws: team.draws,
      syncedAt,
    },
    update: {
      leagueSlug,
      slug: team.slug,
      name: team.name,
      image: team.image,
      wins: team.wins,
      losses: team.losses,
      draws: team.draws,
      syncedAt,
    },
  });
}

async function upsertPlayerSeasons(
  leagueId: string,
  seasonId: string,
  playerStats: Record<
    string,
    {
      playerId: string;
      gamesPlayed: number;
      PTS: number;
      REB: number;
      AST: number;
      STL: number;
      BLK: number;
      '3PM': number;
      efficiency: number;
    }
  >,
  syncedAt: Date,
  dryRun: boolean
): Promise<number> {
  let count = 0;
  for (const row of Object.values(playerStats)) {
    count += 1;
    if (dryRun) continue;
    await prisma.scoreLabPlayerSeason.upsert({
      where: {
        playerScorelabId_leagueId_seasonId: {
          playerScorelabId: row.playerId,
          leagueId,
          seasonId,
        },
      },
      create: {
        playerScorelabId: row.playerId,
        leagueId,
        seasonId,
        gamesPlayed: row.gamesPlayed,
        PTS: row.PTS,
        REB: row.REB,
        AST: row.AST,
        STL: row.STL,
        BLK: row.BLK,
        threePM: row['3PM'],
        efficiency: row.efficiency,
        syncedAt,
      },
      update: {
        gamesPlayed: row.gamesPlayed,
        PTS: row.PTS,
        REB: row.REB,
        AST: row.AST,
        STL: row.STL,
        BLK: row.BLK,
        threePM: row['3PM'],
        efficiency: row.efficiency,
        syncedAt,
      },
    });
  }
  return count;
}

export async function runScorelabSync(options?: {
  dryRun?: boolean;
}): Promise<ScorelabSyncResult> {
  const dryRun = options?.dryRun ?? false;
  const config = getConfig();
  const leagues = [...config.matches.leagues, ...config.matches.archiveLeagues];
  const errors: ScorelabSyncError[] = [];
  let teams = 0;
  let players = 0;
  let playerSeasons = 0;
  const perLeague: Record<string, LeagueSyncCounts> = {};
  const syncedAt = new Date();

  for (const league of leagues) {
    const leagueCounts: LeagueSyncCounts = { teams: 0, players: 0, playerSeasons: 0 };
    await sleep(REQUEST_GAP_MS);
    let leagueSlug = '';
    let seasonId = '';
    let teamList: TeamMeta[] = [];
    try {
      const meta = await fetchSeasonTeamMeta(league.url);
      leagueSlug = meta.leagueSlug;
      seasonId = meta.seasonId;
      teamList = meta.teams;
    } catch (e) {
      errors.push({
        leagueId: league.id,
        message: e instanceof Error ? e.message : 'season_fetch_failed',
      });
      continue;
    }

    await sleep(REQUEST_GAP_MS);
    let seasonData;
    try {
      seasonData = await fetchSeasonData(league.url);
    } catch (e) {
      errors.push({
        leagueId: league.id,
        message: e instanceof Error ? e.message : 'season_parse_failed',
      });
      continue;
    }

    for (const team of teamList) {
      teams += 1;
      leagueCounts.teams += 1;
      try {
        await upsertTeam(league.id, leagueSlug, team, syncedAt, dryRun);
      } catch (e) {
        errors.push({
          leagueId: league.id,
          teamId: team.scorelabId,
          message: e instanceof Error ? e.message : 'team_upsert_failed',
        });
      }
    }

    for (const team of teamList) {
      await sleep(REQUEST_GAP_MS);
      let roster: RosterPlayer[] = [];
      try {
        roster = await fetchTeamRoster(leagueSlug, team.slug);
      } catch (e) {
        errors.push({
          leagueId: league.id,
          teamId: team.scorelabId,
          message: e instanceof Error ? e.message : 'team_roster_fetch_failed',
        });
        continue;
      }

      const seen = new Set(roster.map((p) => p.scorelabId));
      for (const p of roster) {
        players += 1;
        leagueCounts.players += 1;
        if (dryRun) continue;
        try {
          await prisma.scoreLabPlayer.upsert({
            where: {
              leagueId_scorelabId: { leagueId: league.id, scorelabId: p.scorelabId },
            },
            create: {
              scorelabId: p.scorelabId,
              teamScorelabId: team.scorelabId,
              leagueId: league.id,
              name: p.name,
              number: p.number,
              image: p.image,
              active: true,
              former: p.former,
              syncedAt,
            },
            update: {
              teamScorelabId: team.scorelabId,
              name: p.name,
              number: p.number,
              image: p.image,
              active: true,
              former: p.former,
              syncedAt,
            },
          });
        } catch (e) {
          errors.push({
            leagueId: league.id,
            teamId: team.scorelabId,
            message: e instanceof Error ? e.message : 'player_upsert_failed',
          });
        }
      }

      if (!dryRun) {
        try {
          const existing = await prisma.scoreLabPlayer.findMany({
            where: { leagueId: league.id, teamScorelabId: team.scorelabId, active: true },
            select: { scorelabId: true },
          });
          const stale = existing.filter((row) => !seen.has(row.scorelabId));
          if (stale.length > 0) {
            await prisma.scoreLabPlayer.updateMany({
              where: {
                leagueId: league.id,
                scorelabId: { in: stale.map((s) => s.scorelabId) },
              },
              data: { active: false, syncedAt },
            });
          }
        } catch (e) {
          errors.push({
            leagueId: league.id,
            teamId: team.scorelabId,
            message: e instanceof Error ? e.message : 'player_deactivate_failed',
          });
        }
      }
    }

    if (seasonData.playerStats) {
      if (!dryRun) {
        for (const row of Object.values(seasonData.playerStats)) {
          try {
            await prisma.scoreLabPlayer.upsert({
              where: {
                leagueId_scorelabId: { leagueId: league.id, scorelabId: row.playerId },
              },
              create: {
                scorelabId: row.playerId,
                teamScorelabId: row.teamId,
                leagueId: league.id,
                name: row.name,
                number: row.number != null ? String(row.number) : undefined,
                image: undefined,
                active: true,
                former: false,
                syncedAt,
              },
              update: {
                teamScorelabId: row.teamId,
                name: row.name,
                number: row.number != null ? String(row.number) : undefined,
                syncedAt,
              },
            });
          } catch (e) {
            errors.push({
              leagueId: league.id,
              message: e instanceof Error ? e.message : 'player_stats_seed_failed',
            });
          }
        }
      }
      try {
        const n = await upsertPlayerSeasons(
          league.id,
          seasonId || seasonData.seasonId,
          seasonData.playerStats,
          syncedAt,
          dryRun
        );
        playerSeasons += n;
        leagueCounts.playerSeasons += n;
      } catch (e) {
        errors.push({
          leagueId: league.id,
          message: e instanceof Error ? e.message : 'player_season_upsert_failed',
        });
      }
    }

    perLeague[league.id] = leagueCounts;
  }

  return {
    ok: errors.length === 0,
    teams,
    players,
    playerSeasons,
    perLeague,
    errors,
  };
}

export async function recordScorelabSyncRun(
  result: ScorelabSyncResult,
  startedAt: Date,
  finishedAt: Date
) {
  await prisma.scoreLabSyncRun.create({
    data: {
      startedAt,
      finishedAt,
      ok: result.ok,
      teams: result.teams,
      players: result.players,
      errorsJson: result.errors.length ? JSON.stringify(result.errors) : null,
    },
  });
}