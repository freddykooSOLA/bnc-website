import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { getTeamUrl } from '@/lib/scorelab';
import { compareMatchDateDesc } from '@/lib/scorelab-time';
import type { Lang, TopPlayerEntry } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import TeamLogo from '@/components/TeamLogo';
import MatchesTable from '@/components/MatchesTable';
import TeamStatLeaders from '@/components/TeamStatLeaders';
import JsonLd from '@/components/JsonLd';
import { buildTeamSportsTeamJsonLd } from '@/lib/json-ld';

interface PageProps {
  params: { lang: string; leagueId: string; teamId: string };
}

function findLeague(config: ReturnType<typeof getConfig>, leagueId: string) {
  const all = [
    ...config.matches.leagues,
    ...config.matches.archiveLeagues,
  ];
  return all.find((l) => l.id === leagueId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  const league = findLeague(config, params.leagueId);
  if (!league) {
    return { title: config.siteName[lang] };
  }
  try {
    const data = await getCachedSeasonData(league.url);
    const team = data.standings.find((s) => s.teamId === params.teamId);
    const name = team?.teamName ?? params.teamId;
    const t = UI_TEXT[lang];
    return {
      title: `${name} | ${t.teamPageTitle} | ${config.siteName[lang]}`,
      description: `${name} — ${league.season} ${t.teamPageTitle}`,
    };
  } catch {
    const t = UI_TEXT[lang];
    return { title: `${t.teamPageTitle} | ${config.siteName[lang]}` };
  }
}

function teamTopPlayers(
  topPlayers: Partial<Record<string, TopPlayerEntry[]>> | undefined,
  teamId: string
): Partial<Record<string, TopPlayerEntry[]>> {
  if (!topPlayers) return {};
  const result: Partial<Record<string, TopPlayerEntry[]>> = {};
  for (const [key, list] of Object.entries(topPlayers)) {
    const filtered = (list ?? []).filter((p) => p.teamId === teamId);
    if (filtered.length > 0) result[key] = filtered;
  }
  return result;
}

export default async function TeamPage({ params }: PageProps) {
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

  const standing = seasonData.standings.find((s) => s.teamId === params.teamId);
  if (!standing) notFound();

  const teamMatches = seasonData.matches
    .filter(
      (m) => m.homeTeamId === params.teamId || m.awayTeamId === params.teamId
    )
    .sort((a, b) => compareMatchDateDesc(a.date, b.date));

  const leaders = teamTopPlayers(seasonData.topPlayers, params.teamId);
  const scorelabTeamUrl = getTeamUrl(params.teamId);

  const jsonLd = buildTeamSportsTeamJsonLd(
    standing.teamName,
    standing.teamImage,
    lang,
    params.leagueId,
    params.teamId
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
          <TeamLogo
            name={standing.teamName}
            imageUrl={standing.teamImage}
            abbreviation={standing.teamAbbreviation}
            size={80}
          />
          <div className="min-w-0">
            <p className="text-sm text-orange font-semibold mb-1">{league.season}</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary">
              {standing.teamName}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              <span>
                {t.rank}: <strong className="text-primary">{standing.rank}</strong>
              </span>
              <span>
                {t.win}/{t.loss}:{' '}
                <strong className="text-primary">
                  {standing.wins}-{standing.losses}
                </strong>
              </span>
              <span>
                {t.pf}/{t.pa}:{' '}
                <strong className="text-primary">
                  {standing.pointsFor}/{standing.pointsAgainst}
                </strong>
              </span>
            </div>
            <a
              href={scorelabTeamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-primary hover:text-orange underline"
            >
              {t.viewOnScorelab}
            </a>
          </div>
        </div>

        <section className="card mb-8">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            {t.teamLeaders}
          </h2>
          <TeamStatLeaders lang={lang} byCategory={leaders} />
        </section>

        <section className="card">
          <h2 className="font-heading text-xl font-bold text-primary mb-6">
            {t.teamSchedule}
          </h2>
          <MatchesTable
            lang={lang}
            matches={teamMatches}
            seasonStages={seasonData.seasonStages}
            leagueId={params.leagueId}
          />
        </section>

        <p className="text-center mt-6">
          <Link
            href={`/${lang}/matches?season=${params.leagueId}`}
            className="text-sm text-primary hover:text-orange underline"
          >
            {t.backToMatches}
          </Link>
        </p>
      </div>
    </>
  );
}
