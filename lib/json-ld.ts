import type { Lang, MatchRow, PlayerSeasonStats, SeasonData } from '@/types';
import { toHktIsoOffset } from '@/lib/scorelab-time';
import { compareMatchDateDesc } from '@/lib/scorelab-time';
import type { HallOfFameData } from '@/lib/hall-of-fame-data';
import { recapScoreTitle } from '@/lib/match-recap';

const ORG_NAME = 'BNC League';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

export function buildMatchesSportsEventsJsonLd(
  seasonData: SeasonData,
  limit = 20
): object[] {
  const sorted = [...seasonData.matches].sort((a, b) =>
    compareMatchDateDesc(a.date, b.date)
  );
  const slice = sorted.slice(0, limit);

  return slice.map((m) => sportsEventFromMatch(m));
}

function sportsEventFromMatch(match: MatchRow): object {
  const name = `${match.homeTeam} vs ${match.awayTeam}`;
  const eventStatus = match.isMatchEnd
    ? 'https://schema.org/EventCompleted'
    : 'https://schema.org/EventScheduled';

  const event: Record<string, unknown> = {
    '@type': 'SportsEvent',
    name,
    startDate: toHktIsoOffset(match.date),
    eventStatus,
    sport: 'Basketball',
    homeTeam: {
      '@type': 'SportsTeam',
      name: match.homeTeam,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: match.awayTeam,
    },
  };

  if (match.location) {
    event.location = {
      '@type': 'Place',
      name: match.location,
    };
  }

  if (match.homeScore !== null && match.awayScore !== null && match.isMatchEnd) {
    event.competitor = [
      { '@type': 'SportsTeam', name: match.homeTeam },
      { '@type': 'SportsTeam', name: match.awayTeam },
    ];
  }

  return event;
}

export function buildTeamSportsTeamJsonLd(
  teamName: string,
  logoUrl: string | undefined,
  lang: Lang,
  leagueId: string,
  teamId: string
): object {
  const url = `${BASE_URL}/${lang}/teams/${leagueId}/${teamId}`;
  const team: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: teamName,
    sport: 'Basketball',
    url,
    memberOf: {
      '@type': 'SportsOrganization',
      name: ORG_NAME,
    },
  };
  if (logoUrl) {
    team.logo = logoUrl.startsWith('http') ? logoUrl : `${BASE_URL}${logoUrl}`;
  }
  return team;
}

export function buildPlayerPersonJsonLd(
  player: PlayerSeasonStats,
  lang: Lang,
  leagueId: string
): object {
  const teamUrl = `${BASE_URL}/${lang}/teams/${leagueId}/${player.teamId}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: player.name,
    memberOf: {
      '@type': 'SportsTeam',
      name: player.teamName,
      url: teamUrl,
    },
  };
}

export function buildNewsArticleJsonLd(
  item: { leagueId: string; match: MatchRow },
  lang: Lang
): object {
  const headline = recapScoreTitle(item.match);
  const url = `${BASE_URL}/${lang}/news/${item.leagueId}/${item.match.id}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    datePublished: toHktIsoOffset(item.match.date),
    url,
    about: sportsEventFromMatch(item.match),
  };
}

export function buildHallOfFameItemListJsonLd(
  data: HallOfFameData,
  lang: Lang
): object {
  const items = data.seasons
    .filter((s) => s.published)
    .map((season, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: season.title,
      url: `${BASE_URL}/${lang}/hall-of-fame#${season.id}`,
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BNC League Hall of Fame',
    itemListElement: items,
  };
}

export function jsonLdScriptProps(data: object | object[]): {
  type: string;
  dangerouslySetInnerHTML: { __html: string };
} {
  const graph = Array.isArray(data) ? data : [data];
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(
        graph.length === 1 ? graph[0] : { '@context': 'https://schema.org', '@graph': graph }
      ),
    },
  };
}
