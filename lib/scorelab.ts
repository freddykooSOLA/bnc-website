import * as cheerio from 'cheerio';
import type { MatchRow, SeasonData, StandingRow } from '@/types';

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
}

/** 从 ScoreLab 赛季页面获取并解析数据 */
export async function fetchSeasonData(seasonUrl: string): Promise<SeasonData> {
  const response = await fetch(seasonUrl, {
    headers: {
      'User-Agent': 'BNC-League-Website/1.0',
      Accept: 'text/html',
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
    const season = data?.props?.pageProps?.initialSeasonData;
    if (!season) return null;
    return transformSeasonData(season);
  } catch {
    return null;
  }
}

function transformSeasonData(season: {
  _id: string;
  name: string;
  teams?: RawTeam[];
  matches?: RawMatch[];
}): SeasonData {
  const standings: StandingRow[] = (season.teams || [])
    .map((t) => ({
      rank: t.ranking ?? 0,
      teamId: t._id,
      teamName: t.name,
      teamUrl: getTeamUrl(t._id),
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
    .map((m) => ({
      id: m._id,
      matchUrl: getMatchUrl(m._id),
      date: m.details?.matchDate ?? '',
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeTeam: m.homeTeamDetails?.name ?? m.homeTeamId,
      awayTeam: m.awayTeamDetails?.name ?? m.awayTeamId,
      homeTeamUrl: getTeamUrl(m.homeTeamId),
      awayTeamUrl: getTeamUrl(m.awayTeamId),
      homeScore: m.score?.home?.total ?? null,
      awayScore: m.score?.away?.total ?? null,
      status: m.isMatchEnd ? 'completed' : 'upcoming',
      location: m.details?.matchLocation ?? '',
      isMatchEnd: m.isMatchEnd ?? false,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    seasonId: season._id,
    seasonName: season.name,
    standings,
    matches,
  };
}

function parseHtmlTables(html: string, seasonUrl: string): SeasonData {
  const $ = cheerio.load(html);
  const standings: StandingRow[] = [];
  const matches: MatchRow[] = [];

  $('table').eq(1).find('tbody tr').each((_, row) => {
    const cells = $(row).find('td').map((__, cell) => $(cell).text().trim()).get();
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
  return {
    seasonId,
    seasonName: $('title').text() || 'Season',
    standings,
    matches,
  };
}
