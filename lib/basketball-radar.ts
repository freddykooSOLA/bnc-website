import type { PlayerSeasonStats } from '@/types';

export type RadarAxis = 'PTS' | 'REB' | 'AST' | 'STL' | 'BLK' | '3PM';

export const RADAR_AXES: RadarAxis[] = ['PTS', 'REB', 'AST', 'STL', 'BLK', '3PM'];

export const RADAR_LABEL: Record<RadarAxis, Record<'zh-hk' | 'zh-cn' | 'en', string>> = {
  PTS: { 'zh-hk': '得分', 'zh-cn': '得分', en: 'PTS' },
  REB: { 'zh-hk': '籃板', 'zh-cn': '篮板', en: 'REB' },
  AST: { 'zh-hk': '助攻', 'zh-cn': '助攻', en: 'AST' },
  STL: { 'zh-hk': '抄截', 'zh-cn': '抄截', en: 'STL' },
  BLK: { 'zh-hk': '封阻', 'zh-cn': '封阻', en: 'BLK' },
  '3PM': { 'zh-hk': '三分命中', 'zh-cn': '三分命中', en: '3PM' },
};

function perGame(player: PlayerSeasonStats, axis: RadarAxis): number {
  const gp = player.gamesPlayed || 0;
  if (!gp) return 0;
  const total = axis === '3PM' ? player['3PM'] : player[axis];
  return total / gp;
}

/** ScoreLab `playerStats` fields are season totals — divide by gamesPlayed for per-game radar. */
export function playerPerGameAverages(player: PlayerSeasonStats): Record<RadarAxis, number> {
  return {
    PTS: perGame(player, 'PTS'),
    REB: perGame(player, 'REB'),
    AST: perGame(player, 'AST'),
    STL: perGame(player, 'STL'),
    BLK: perGame(player, 'BLK'),
    '3PM': perGame(player, '3PM'),
  };
}

/** Percentile 0–100 within league (higher per-game stat = higher score). */
export function buildLeagueRadarPercentiles(
  player: PlayerSeasonStats,
  leaguePlayers: Record<string, PlayerSeasonStats>
): Record<RadarAxis, number> {
  const pool = Object.values(leaguePlayers).filter((p) => p.gamesPlayed > 0);
  const values: Record<RadarAxis, number> = playerPerGameAverages(player);
  const out = {} as Record<RadarAxis, number>;

  for (const axis of RADAR_AXES) {
    const sorted = pool
      .map((p) => perGame(p, axis))
      .sort((a, b) => a - b);
    const v = values[axis];
    if (sorted.length === 0) {
      out[axis] = 0;
      continue;
    }
    const below = sorted.filter((x) => x <= v).length;
    out[axis] = Math.round((below / sorted.length) * 100);
  }

  return out;
}

export function aggregateCareerStats(
  rows: PlayerSeasonStats[]
): {
  games: number;
  PTS: number;
  REB: number;
  AST: number;
  STL: number;
  BLK: number;
  threePm: number;
} {
  let games = 0;
  let PTS = 0;
  let REB = 0;
  let AST = 0;
  let STL = 0;
  let BLK = 0;
  let threePm = 0;
  for (const p of rows) {
    games += p.gamesPlayed;
    PTS += p.PTS;
    REB += p.REB;
    AST += p.AST;
    STL += p.STL;
    BLK += p.BLK;
    threePm += p['3PM'];
  }
  return { games, PTS, REB, AST, STL, BLK, threePm };
}