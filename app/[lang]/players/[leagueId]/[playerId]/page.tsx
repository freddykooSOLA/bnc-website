import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { teamPagePath } from '@/lib/team-links';
import JsonLd from '@/components/JsonLd';
import { buildPlayerPersonJsonLd } from '@/lib/json-ld';
import {
  STAT_LEADER_CATEGORIES,
  statCategoryLabel,
  type StatLeaderCategory,
} from '@/lib/scorelab-helpers';
import {
  buildPlayerStatRanks,
  playerStatTotal,
} from '@/lib/player-ranks';

interface PageProps {
  params: { lang: string; leagueId: string; playerId: string };
}

function findLeague(config: ReturnType<typeof getConfig>, leagueId: string) {
  const all = [...config.matches.leagues, ...config.matches.archiveLeagues];
  return all.find((l) => l.id === leagueId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  const league = findLeague(config, params.leagueId);
  const t = UI_TEXT[lang];
  if (!league) return { title: config.siteName[lang] };
  try {
    const data = await getCachedSeasonData(league.url);
    const player = data.playerStats?.[params.playerId];
    const name = player?.name ?? params.playerId;
    return {
      title: `${name} | ${t.playerPageTitle} | ${config.siteName[lang]}`,
      description: `${name} — ${league.season} ${t.playerPageTitle}`,
    };
  } catch {
    return { title: `${t.playerPageTitle} | ${config.siteName[lang]}` };
  }
}

function formatAvg(total: number, games: number): string {
  if (!games) return '—';
  return (total / games).toFixed(1);
}

export default async function PlayerPage({ params }: PageProps) {
  const lang = params.lang as Lang;
  const config = getConfig();
  const t = UI_TEXT[lang];
  const league = findLeague(config, params.leagueId);
  if (!league) notFound();

  let seasonData;
  try {
    seasonData = await getCachedSeasonData(league.url);
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">{t.scorelabUnavailable}</p>
        <a
          href={league.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-orange underline"
        >
          {t.viewOnScorelab}
        </a>
      </div>
    );
  }

  const player = seasonData.playerStats?.[params.playerId];
  if (!player) notFound();

  const ranks = seasonData.playerStats
    ? buildPlayerStatRanks(seasonData.playerStats)
    : null;

  const jsonLd = buildPlayerPersonJsonLd(player, lang, params.leagueId);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <p className="text-sm text-orange font-semibold mb-2">{league.season}</p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
          {player.number != null && player.number !== '' ? `#${player.number} ` : ''}
          {player.name}
        </h1>
        <p className="text-gray-600 mb-8">
          <Link
            href={teamPagePath(lang, params.leagueId, player.teamId)}
            className="text-primary hover:text-orange underline"
          >
            {player.teamName}
          </Link>
        </p>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="py-3 pr-4">{t.statLeaders}</th>
                <th className="py-3 pr-4">{t.seasonTotals}</th>
                <th className="py-3 pr-4">{t.seasonAvg}</th>
                <th className="py-3">{t.leagueRank}</th>
              </tr>
            </thead>
            <tbody>
              {STAT_LEADER_CATEGORIES.map((cat) => {
                const total = playerStatTotal(player, cat as StatLeaderCategory);
                const rank = ranks?.[cat as StatLeaderCategory]?.get(player.playerId);
                return (
                  <tr key={cat} className="border-b border-gray-50">
                    <td className="py-3 pr-4 font-medium text-primary">
                      {statCategoryLabel(cat as StatLeaderCategory, lang)}
                    </td>
                    <td className="py-3 pr-4 font-bold">{total}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatAvg(total, player.gamesPlayed)} {t.perGame}
                    </td>
                    <td className="py-3 text-gray-600">
                      {rank
                        ? t.rankNth.replace('{n}', String(rank))
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4">
            {t.scorelabCredit} · {player.gamesPlayed} GP
          </p>
        </div>

        <p className="text-center mt-8">
          <Link
            href={teamPagePath(lang, params.leagueId, player.teamId)}
            className="text-sm text-primary hover:text-orange underline"
          >
            {t.backToTeam}
          </Link>
        </p>
      </div>
    </>
  );
}
