import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { databaseEnabled, prisma } from '@/lib/prisma';
import { listRelatedApprovedPlayerLinks } from '@/lib/player-link-service';
import { loadLeaguePlayerStatsFromDb, loadPlayerSeasonFromDb } from '@/lib/scorelab-db';
import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { teamPagePath } from '@/lib/team-links';
import JsonLd from '@/components/JsonLd';
import { buildPlayerPersonJsonLd } from '@/lib/json-ld';
import { buildPlayerStatRanks } from '@/lib/player-ranks';
import BasketballRadar from '@/components/BasketballRadar';
import PlayerSeasonStatsTable from '@/components/PlayerSeasonStatsTable';
import {
  buildLeagueRadarPercentiles,
  playerPerGameAverages,
} from '@/lib/basketball-radar';

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

export default async function PlayerPage({ params }: PageProps) {
  const lang = params.lang as Lang;
  const config = getConfig();
  const t = UI_TEXT[lang];
  const league = findLeague(config, params.leagueId);
  if (!league) notFound();

  let playerImage: string | undefined;
  if (databaseEnabled()) {
    const row = await prisma.scoreLabPlayer.findUnique({
      where: {
        leagueId_scorelabId: {
          leagueId: params.leagueId,
          scorelabId: params.playerId,
        },
      },
      select: { image: true },
    });
    if (row?.image) playerImage = row.image;
  }

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

  let player = seasonData.playerStats?.[params.playerId];
  if (!player) {
    const fromDb = await loadPlayerSeasonFromDb(params.leagueId, params.playerId);
    if (!fromDb) notFound();
    player = fromDb;
  }

  const leagueStats =
    (await loadLeaguePlayerStatsFromDb(params.leagueId)) ?? seasonData.playerStats ?? null;

  const ranks = leagueStats ? buildPlayerStatRanks(leagueStats) : null;

  const radarPercentiles = leagueStats
    ? buildLeagueRadarPercentiles(player, leagueStats)
    : null;

  const related =
    databaseEnabled() && (await listRelatedApprovedPlayerLinks(params.leagueId, params.playerId));

  const alsoCopy =
    lang === 'en' ? 'Also plays in' : lang === 'zh-cn' ? '也参加' : '也參加';

  const jsonLd = buildPlayerPersonJsonLd(player, lang, params.leagueId);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <p className="text-sm text-orange font-semibold mb-2">{league.season}</p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2 flex flex-wrap items-center gap-4">
          {playerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={playerImage}
              alt=""
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border border-gray-200"
            />
          ) : null}
          <span>
            {player.number != null && player.number !== '' ? `#${player.number} ` : ''}
            {player.name}
          </span>
        </h1>
        {related && related.length > 0 ? (
          <p className="text-base text-gray-600 mb-4">
            {alsoCopy}：{' '}
            {related.map((r, i) => (
              <span key={`${r.leagueId}-${r.playerId}`}>
                {i > 0 ? ' · ' : ''}
                <Link
                  href={`/${lang}/players/${r.leagueId}/${r.playerId}`}
                  className="text-primary hover:text-orange underline"
                >
                  {r.leagueSeason} · {r.teamName}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
        <p className="text-gray-600 mb-8">
          <Link
            href={teamPagePath(lang, params.leagueId, player.teamId)}
            className="text-primary hover:text-orange underline"
          >
            {player.teamName}
          </Link>
        </p>

        {radarPercentiles ? (
          <div className="card mb-8">
            <BasketballRadar
              lang={lang}
              percentiles={radarPercentiles}
              gamesPlayed={player.gamesPlayed}
              averages={playerPerGameAverages(player)}
            />
          </div>
        ) : null}

        <div className="card max-w-full overflow-x-hidden">
          <PlayerSeasonStatsTable lang={lang} player={player} ranks={ranks} />
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

