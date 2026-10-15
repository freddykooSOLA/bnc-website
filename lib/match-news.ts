import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { compareMatchDateDesc } from '@/lib/scorelab-time';
import type { LeagueConfig, MatchRow } from '@/types';

export interface NewsMatchItem {
  leagueId: string;
  leagueLabel: string;
  season: string;
  match: MatchRow;
}

export function allLeaguesFromConfig(): LeagueConfig[] {
  const config = getConfig();
  return [...config.matches.leagues, ...config.matches.archiveLeagues];
}

/** 所有聯賽已完賽場次，日期倒序 */
export async function fetchCompletedNewsMatches(
  leagueFilter?: string
): Promise<NewsMatchItem[]> {
  const leagues = allLeaguesFromConfig().filter(
    (l) => !leagueFilter || l.id === leagueFilter
  );
  const items: NewsMatchItem[] = [];

  await Promise.all(
    leagues.map(async (league) => {
      try {
        const data = await getCachedSeasonData(league.url);
        for (const match of data.matches) {
          if (match.isMatchEnd && match.homeScore !== null && match.awayScore !== null) {
            items.push({
              leagueId: league.id,
              leagueLabel: league.league,
              season: league.season,
              match,
            });
          }
        }
      } catch {
        // skip league
      }
    })
  );

  items.sort((a, b) => compareMatchDateDesc(a.match.date, b.match.date));
  return items;
}

export async function findNewsMatch(
  leagueId: string,
  matchId: string
): Promise<NewsMatchItem | null> {
  const league = allLeaguesFromConfig().find((l) => l.id === leagueId);
  if (!league) return null;
  try {
    const data = await getCachedSeasonData(league.url);
    const match = data.matches.find((m) => m.id === matchId);
    if (!match || !match.isMatchEnd) return null;
    return {
      leagueId: league.id,
      leagueLabel: league.league,
      season: league.season,
      match,
    };
  } catch {
    return null;
  }
}

export const NEWS_PAGE_SIZE = 12;
