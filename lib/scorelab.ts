import * as cheerio from 'cheerio';
import type {
  MatchRow,
  PlayerSeasonStats,
  SeasonData,
  SeasonStage,
  StandingRow,
  TopPlayerEntry,
} from '@/types';
import type { StatLeaderCategory } from '@/lib/scorelab-helpers';
import { STAT_LEADER_CATEGORIES, getPlayerStatValue } from '@/lib/scorelab-helpers';
import { compareMatchDateDesc } from '@/lib/scorelab-time';

const SCORELAB_BASE =
  process.env.NEXT_PUBLIC_SCORELAB_BASE_URL || 'https://www.scorelab.tech';

/** ScoreLab 球队详情页 URL */
export function getTeamUrl(teamId: string): string {
  return `${SCORELAB_BASE}/team/${teamId}`;
}

/** ScoreLab 比赛详情页 URL */
export function getMatchUrl(matchId: string): string {
  return `${SCORELAB_BASE}/match/${matchId}`;
}

/** ScoreLab 原始球队数据 */
interface RawTeam {
  _id: string;
  name: string;
  image?: string;
  abbreviation?: string;
  ranking?: number;
  points?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  pointsDifferential?: number;
  matchesPlayed?: number;
  record?: { wins: number; losses: number; draws: number };
}

/** ScoreLab 原始比赛数据 */
interface RawMatch {
  _id: string;
  isMatchEnd?: boolean;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamDetails?: { name: string };
  awayTeamDetails?: { name: string };
  score?: { home?: { total: number }; away?: { total: number } };
  details?: { matchDate?: string; matchLocation?: string };
  youtube?: string;
  isPlayoff?: boolean;
  stageId?: string;
  isForfeit?: boolean;
}

interface RawSeasonStage {
  _id?: string;
  id?: string;
  type?: 'group' | 'playoff';
  name: string;
  order?: number;
}

/** 从 ScoreLab 赛季页面获取并解析数据 */
export async function fetchSeasonData(seasonUrl: string): Promise<SeasonData> {
  const url = new URL(seasonUrl);
  url.searchParams.set('_', String(Date.now()));

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'BNC-League-Website/1.0',
      Accept: 'text/html',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`ScoreLab 请求失败: ${response.status}`);
  }

  const html = await response.text();
  const jsonData = parseNextData(html);
  if (jsonData) return jsonData;

  return parseHtmlTables(html, seasonUrl);
}

function parseNextData(html: string): SeasonData | null {
  const $ = cheerio.load(html);
  const scriptContent = $('#__NEXT_DATA__').html();
  if (!scriptContent) return null;

  try {
    const data = JSON.parse(scriptContent);
    const pageProps = data?.props?.pageProps;
    const season = pageProps?.seasonData ?? pageProps?.initialSeasonData;
    if (!season) return null;
    return transformSeasonData(season);
  } catch {
    return null;
  }
}

function parseTopPlayers(
  raw: Record<string, unknown[]> | undefined,
  teamImageById: Map<string, string>
): Partial<Record<string, TopPlayerEntry[]>> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const result: Partial<Record<string, TopPlayerEntry[]>> = {};

  for (const key of STAT_LEADER_CATEGORIES) {
    const list = raw[key];
    if (!Array.isArray(list) || list.length === 0) continue;

    const entries: TopPlayerEntry[] = list.map((item) => {
      const p = item as Record<string, unknown>;
      const teamId = typeof p.teamId === 'string' ? p.teamId : undefined;
      const gamesPlayed =
        typeof p.gamesPlayed === 'number' ? p.gamesPlayed : 0;
      const playerId =
        typeof p.playerId === 'string' ? p.playerId : undefined;
      return {
        playerId,
        name: String(p.name ?? ''),
        number: p.number as string | number | undefined,
        teamId,
        teamName: String(p.teamName ?? ''),
        teamImage: teamId ? teamImageById.get(teamId) : undefined,
        gamesPlayed,
        value: getPlayerStatValue(p, key as StatLeaderCategory),
      };
    });

    result[key] = entries;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function parsePlayerStats(
  raw: Record<string, unknown> | undefined
): Record<string, PlayerSeasonStats> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const result: Record<string, PlayerSeasonStats> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== 'object') continue;
    const p = val as Record<string, unknown>;
    const playerId = String(p.playerId ?? key);
    result[playerId] = {
      playerId,
      name: String(p.name ?? ''),
      number: p.number as string | number | undefined,
      teamId: String(p.teamId ?? ''),
      teamName: String(p.teamName ?? ''),
      gamesPlayed: typeof p.gamesPlayed === 'number' ? p.gamesPlayed : 0,
      PTS: getPlayerStatValue(p, 'PTS'),
      REB: getPlayerStatValue(p, 'REB'),
      AST: getPlayerStatValue(p, 'AST'),
      STL: getPlayerStatValue(p, 'STL'),
      BLK: getPlayerStatValue(p, 'BLK'),
      '3PM': getPlayerStatValue(p, '3PM'),
      efficiency: getPlayerStatValue(p, 'efficiency'),
    };
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function transformSeasonData(season: {
  _id: string;
  name: string;
  teams?: RawTeam[];
  matches?: RawMatch[];
  seasonStages?: RawSeasonStage[];
  isSeasonEnd?: boolean;
  topPlayers?: Record<string, unknown[]>;
  playerStats?: Record<string, unknown>;
}): SeasonData {
  const teamMeta = new Map<
    string,
    { image?: string; abbreviation?: string; name: string }
  >();
  for (const t of season.teams || []) {
    teamMeta.set(t._id, {
      image: t.image,
      abbreviation: t.abbreviation,
      name: t.name,
    });
  }

  const teamImageById = new Map<string, string>();
  teamMeta.forEach((meta, id) => {
    if (meta.image) teamImageById.set(id, meta.image);
  });

  const standings: StandingRow[] = (season.teams || [])
    .map((t) => ({
      rank: t.ranking ?? 0,
      teamId: t._id,
      teamName: t.name,
      teamUrl: getTeamUrl(t._id),
      teamImage: t.image,
      teamAbbreviation: t.abbreviation,
      points: t.points ?? 0,
      wins: t.record?.wins ?? 0,
      losses: t.record?.losses ?? 0,
      draws: t.record?.draws ?? 0,
      pointsFor: t.pointsFor ?? 0,
      pointsAgainst: t.pointsAgainst ?? 0,
      pointsDifferential: t.pointsDifferential ?? 0,
      matchesPlayed: t.matchesPlayed ?? 0,
    }))
    .sort((a, b) => a.rank - b.rank);

  const matches: MatchRow[] = (season.matches || [])
    .map((m) => {
      const homeMeta = teamMeta.get(m.homeTeamId);
      const awayMeta = teamMeta.get(m.awayTeamId);
      const ended = m.isMatchEnd ?? false;
      const homeTotal = m.score?.home?.total;
      const awayTotal = m.score?.away?.total;

      return {
        id: m._id,
        matchUrl: getMatchUrl(m._id),
        date: m.details?.matchDate ?? '',
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        homeTeam: m.homeTeamDetails?.name ?? homeMeta?.name ?? m.homeTeamId,
        awayTeam: m.awayTeamDetails?.name ?? awayMeta?.name ?? m.awayTeamId,
        homeTeamUrl: getTeamUrl(m.homeTeamId),
        awayTeamUrl: getTeamUrl(m.awayTeamId),
        homeTeamImage: homeMeta?.image,
        awayTeamImage: awayMeta?.image,
        homeTeamAbbreviation: homeMeta?.abbreviation,
        awayTeamAbbreviation: awayMeta?.abbreviation,
        homeScore: ended && homeTotal !== undefined ? homeTotal : null,
        awayScore: ended && awayTotal !== undefined ? awayTotal : null,
        status: ended ? 'completed' : 'upcoming',
        location: m.details?.matchLocation ?? '',
        isMatchEnd: ended,
        youtube: m.youtube || undefined,
        stageId: m.stageId,
        isPlayoff: m.isPlayoff,
        isForfeit: m.isForfeit,
      };
    })
    .sort((a, b) => compareMatchDateDesc(a.date, b.date));

  const seasonStages: SeasonStage[] | undefined = season.seasonStages?.length
    ? season.seasonStages.map((s) => ({
        id: s._id ?? s.id ?? s.name,
        type: s.type === 'playoff' ? 'playoff' : 'group',
        name: s.name,
        order: s.order,
      }))
    : undefined;

  const topPlayers = parseTopPlayers(season.topPlayers, teamImageById);
  const playerStats = parsePlayerStats(season.playerStats);

  return {
    seasonId: season._id,
    seasonName: season.name,
    standings,
    matches,
    seasonStages,
    isSeasonEnd: season.isSeasonEnd,
    topPlayers,
    playerStats,
  };
}

function parseHtmlTables(html: string, seasonUrl: string): SeasonData {
  const $ = cheerio.load(html);
  const standings: StandingRow[] = [];
  const matches: MatchRow[] = [];

  $('table')
    .eq(1)
    .find('tbody tr')
    .each((_, row) => {
      const cells = $(row)
        .find('td')
        .map((__, cell) => $(cell).text().trim())
        .get();
      if (cells.length >= 10) {
        standings.push({
          rank: parseInt(cells[0], 10) || 0,
          teamId: cells[1],
          teamName: cells[1],
          points: parseInt(cells[2], 10) || 0,
          matchesPlayed: parseInt(cells[3], 10) || 0,
          wins: parseInt(cells[4], 10) || 0,
          losses: parseInt(cells[5], 10) || 0,
          draws: parseInt(cells[6], 10) || 0,
          pointsFor: parseInt(cells[7], 10) || 0,
          pointsAgainst: parseInt(cells[8], 10) || 0,
          pointsDifferential: parseInt(cells[9], 10) || 0,
        });
      }
    });

  const seasonId = seasonUrl.split('/').pop() || 'unknown';
  if (matches.length === 0) {
    console.warn(
      `[scorelab] HTML fallback parsed 0 matches for season "${seasonId}" — __NEXT_DATA__ may have changed`
    );
  }
  return {
    seasonId,
    seasonName: $('title').text() || 'Season',
    standings,
    matches,
  };
}
