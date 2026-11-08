import * as cheerio from 'cheerio';
import { unstable_cache } from 'next/cache';

const SCORELAB_BASE =
  process.env.NEXT_PUBLIC_SCORELAB_BASE_URL || 'https://www.scorelab.tech';
const MATCH_ID = /^[a-f0-9]{24}$/i;

export interface PeriodScore {
  home: number;
  away: number;
}

export interface BoxPlayer {
  playerId: string;
  name: string;
  jersey: string;
  teamName: string;
}

export type LeaderKey = 'PTS' | 'AST' | 'REB' | '3PM';

export interface BoxLeader {
  key: LeaderKey;
  value: number;
  players: BoxPlayer[];
}

export interface PlayerLine {
  playerId: string;
  name: string;
  jersey: string;
  pts: number;
  reb: number;
  ast: number;
  threes: number;
}

export interface TeamLines {
  side: 'home' | 'away';
  name: string;
  players: PlayerLine[];
}

export interface MatchBox {
  quarters: PeriodScore[];
  overtime: PeriodScore[];
  leaders: BoxLeader[];
  teams: TeamLines[];
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function periods(home: unknown, away: unknown): PeriodScore[] {
  const left = Array.isArray(home) ? home : [];
  const right = Array.isArray(away) ? away : [];
  const count = Math.max(left.length, right.length);
  const rows: PeriodScore[] = [];
  for (let i = 0; i < count; i += 1) {
    rows.push({ home: num(left[i]), away: num(right[i]) });
  }
  return rows;
}

function points(row: Record<string, unknown>): number {
  return num(row['1PM']) + num(row['2PM']) * 2 + num(row['3PM']) * 3;
}

function rebounds(row: Record<string, unknown>): number {
  return num(row.OREB) + num(row.DREB);
}

function readPlayers(
  roster: unknown,
  teamName: string
): Map<string, BoxPlayer> {
  const people = new Map<string, BoxPlayer>();
  if (!Array.isArray(roster)) return people;
  for (const item of roster) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const details =
      row.playerDetails && typeof row.playerDetails === 'object'
        ? (row.playerDetails as Record<string, unknown>)
        : {};
    const playerId = String(row.playerId ?? details._id ?? '');
    const name = String(details.name ?? '').trim();
    if (!playerId || !name) continue;
    people.set(playerId, {
      playerId,
      name,
      jersey: String(row.jersey ?? details.number ?? '').trim(),
      teamName,
    });
  }
  return people;
}

function leadersFrom(
  rows: Record<string, unknown>[],
  people: Map<string, BoxPlayer>
): BoxLeader[] {
  const specs: { key: LeaderKey; value: (row: Record<string, unknown>) => number }[] = [
    { key: 'PTS', value: points },
    { key: 'AST', value: (row) => num(row.AST) },
    { key: 'REB', value: rebounds },
    { key: '3PM', value: (row) => num(row['3PM']) },
  ];

  return specs.flatMap((spec) => {
    let best = 0;
    const holders: BoxPlayer[] = [];
    for (const row of rows) {
      const player = people.get(String(row.playerId ?? ''));
      if (!player) continue;
      const value = spec.value(row);
      if (value <= 0) continue;
      if (value > best) {
        best = value;
        holders.length = 0;
        holders.push(player);
      } else if (value === best) {
        holders.push(player);
      }
    }
    if (!best || holders.length === 0) return [];
    holders.sort((a, b) => a.jersey.localeCompare(b.jersey) || a.name.localeCompare(b.name));
    return [{ key: spec.key, value: best, players: holders }];
  });
}

/** 從比賽頁的 __NEXT_DATA__ 取出每節比分和四項個人數據。 */
export function parseMatchBox(html: string): MatchBox | null {
  const script = cheerio.load(html)('#__NEXT_DATA__').html();
  if (!script) return null;
  let page: Record<string, unknown>;
  try {
    page = JSON.parse(script)?.props?.pageProps ?? {};
  } catch {
    return null;
  }

  const match =
    page.initialMatchData && typeof page.initialMatchData === 'object'
      ? (page.initialMatchData as Record<string, unknown>)
      : {};
  const score =
    match.score && typeof match.score === 'object'
      ? (match.score as Record<string, unknown>)
      : {};
  const homeScore =
    score.home && typeof score.home === 'object'
      ? (score.home as Record<string, unknown>)
      : {};
  const awayScore =
    score.away && typeof score.away === 'object'
      ? (score.away as Record<string, unknown>)
      : {};
  const quarters = periods(homeScore.breakdown, awayScore.breakdown);
  const overtime = periods(homeScore.overtime, awayScore.overtime);

  const homeName = String(
    (match.homeTeamDetails as { name?: string } | undefined)?.name ?? ''
  );
  const awayName = String(
    (match.awayTeamDetails as { name?: string } | undefined)?.name ?? ''
  );
  const roster =
    match.roster && typeof match.roster === 'object'
      ? (match.roster as Record<string, unknown>)
      : {};
  const people = readPlayers(roster.home, homeName);
  readPlayers(roster.away, awayName).forEach((player, id) => {
    people.set(id, player);
  });

  const box =
    page.initialBoxScoreData && typeof page.initialBoxScoreData === 'object'
      ? (page.initialBoxScoreData as Record<string, unknown>)
      : {};
  const rows = Array.isArray(box.score)
    ? box.score.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object')
    : [];
  const leaders = leadersFrom(rows, people);
  const teams = teamLines(rows, people, homeName, awayName);

  if (quarters.length === 0 && leaders.length === 0 && teams.every((team) => team.players.length === 0)) {
    return null;
  }
  return { quarters, overtime, leaders, teams };
}

function teamLines(
  rows: Record<string, unknown>[],
  people: Map<string, BoxPlayer>,
  homeName: string,
  awayName: string
): TeamLines[] {
  const grouped: Record<'home' | 'away', PlayerLine[]> = { home: [], away: [] };
  for (const row of rows) {
    const side = row.side === 'away' ? 'away' : row.side === 'home' ? 'home' : null;
    const player = people.get(String(row.playerId ?? ''));
    if (!side || !player) continue;
    const line: PlayerLine = {
      playerId: player.playerId,
      name: player.name,
      jersey: player.jersey,
      pts: points(row),
      reb: rebounds(row),
      ast: num(row.AST),
      threes: num(row['3PM']),
    };
    if (line.pts === 0 && line.reb === 0 && line.ast === 0 && line.threes === 0 && num(row.MINS) === 0) {
      continue;
    }
    grouped[side].push(line);
  }
  const sortLines = (lines: PlayerLine[]) =>
    lines.sort((a, b) => b.pts - a.pts || b.reb - a.reb || a.name.localeCompare(b.name));
  return [
    { side: 'home', name: homeName, players: sortLines(grouped.home) },
    { side: 'away', name: awayName, players: sortLines(grouped.away) },
  ];
}

async function fetchMatchBox(matchId: string): Promise<MatchBox | null> {
  if (!MATCH_ID.test(matchId)) return null;
  const response = await fetch(`${SCORELAB_BASE}/match/${matchId}`, {
    headers: {
      'User-Agent': 'BNC-League-Website/1.0',
      Accept: 'text/html',
    },
    next: { revalidate: 300 },
  });
  if (!response.ok) return null;
  return parseMatchBox(await response.text());
}

export function getCachedMatchBox(matchId: string): Promise<MatchBox | null> {
  return unstable_cache(() => fetchMatchBox(matchId), ['scorelab-match-box', matchId], {
    revalidate: 300,
  })();
}
