import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';
import { generatePageMetadata } from '@/lib/seo';
import type { Lang, SeasonData } from '@/types';
import MatchesContent from '@/components/MatchesContent';
import MatchesServerPreview from '@/components/MatchesServerPreview';
import { homeIntroParagraphs } from '@/lib/home-intro';
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
  let initialSeasonData: SeasonData | null = null;
  if (defaultLeague) {
    try {
      const seasonData = await getCachedSeasonData(defaultLeague.url);
      initialSeasonData = seasonData;
      jsonLdEvents = buildMatchesSportsEventsJsonLd(seasonData);
    } catch {
      jsonLdEvents = [];
    }
  }

  const intro = homeIntroParagraphs(lang, config).slice(0, 2).join(' ');

  return (
    <>
      {jsonLdEvents.length > 0 && <JsonLd data={jsonLdEvents} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <p className="text-gray-700 leading-relaxed max-w-3xl">{intro}</p>
      </div>
      {defaultLeague && initialSeasonData ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MatchesServerPreview
            lang={lang}
            league={defaultLeague}
            seasonData={initialSeasonData}
          />
        </div>
      ) : null}
      <MatchesContent
        lang={lang}
        config={config}
        leagueLists={leagueLists}
        initialLeagueId={defaultLeague?.id}
        initialSeasonData={initialSeasonData ?? undefined}
      />
    </>
  );
}
