import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';
import { generatePageMetadata } from '@/lib/seo';
import type { Lang } from '@/types';
import MatchesContent from '@/components/MatchesContent';
import JsonLd from '@/components/JsonLd';
import { resolveMatchesLeagueLists } from '@/lib/matches-leagues';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { buildMatchesSportsEventsJsonLd } from '@/lib/json-ld';

interface MatchesPageProps {
  params: { lang: string };
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  return generatePageMetadata(lang, config, config.seo.matches, '/matches');
}

/** 比赛页面 */
export default async function MatchesPage({ params }: MatchesPageProps) {
  const lang = params.lang as Lang;
  const config = getConfig();
  const leagueLists = await resolveMatchesLeagueLists(config);

  const defaultLeague =
    leagueLists.latest.find((l) => l.id === config.matches.defaultLeagueId) ??
    leagueLists.latest[0];

  let jsonLdEvents: object[] = [];
  if (defaultLeague) {
    try {
      const seasonData = await getCachedSeasonData(defaultLeague.url);
      jsonLdEvents = buildMatchesSportsEventsJsonLd(seasonData);
    } catch {
      jsonLdEvents = [];
    }
  }

  return (
    <>
      {jsonLdEvents.length > 0 && <JsonLd data={jsonLdEvents} />}
      <MatchesContent lang={lang} config={config} leagueLists={leagueLists} />
    </>
  );
}
