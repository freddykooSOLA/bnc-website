import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { UI_TEXT } from '@/lib/i18n';
import type { Lang } from '@/types';
import { findNewsMatch } from '@/lib/match-news';
import {
  recapMetaLine,
  recapResultSentence,
  recapScoreTitle,
} from '@/lib/match-recap';
import { teamPagePath } from '@/lib/team-links';
import JsonLd from '@/components/JsonLd';
import { buildNewsArticleJsonLd } from '@/lib/json-ld';
import YoutubeReplayButton from '@/components/YoutubeReplayButton';
import TeamLogo from '@/components/TeamLogo';

interface PageProps {
  params: { lang: string; leagueId: string; matchId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  const item = await findNewsMatch(params.leagueId, params.matchId);
  if (!item) return { title: config.siteName[lang] };
  return {
    title: `${recapScoreTitle(item.match)} | ${UI_TEXT[lang].newsTitle}`,
    description: recapResultSentence(item.match, lang),
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const lang = params.lang as Lang;
  const t = UI_TEXT[lang];
  const item = await findNewsMatch(params.leagueId, params.matchId);
  if (!item) notFound();

  const { match, leagueId, season } = item;
  const jsonLd = buildNewsArticleJsonLd(item, lang);

  const homeTeamId = match.homeTeamId;
  const awayTeamId = match.awayTeamId;

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
        <p className="text-sm text-orange font-semibold mb-2">{season}</p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
          {recapScoreTitle(match)}
        </h1>
        <p className="text-gray-600 mb-6">{recapMetaLine(match, lang)}</p>
        <p className="text-lg text-gray-800 mb-8">{recapResultSentence(match, lang)}</p>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          {homeTeamId && (
            <Link
              href={teamPagePath(lang, leagueId, homeTeamId)}
              className="flex items-center gap-2 text-primary hover:text-orange"
            >
              <TeamLogo name={match.homeTeam} imageUrl={match.homeTeamImage} size={36} />
              <span className="font-medium">{match.homeTeam}</span>
            </Link>
          )}
          <span className="text-gray-400">vs</span>
          {awayTeamId && (
            <Link
              href={teamPagePath(lang, leagueId, awayTeamId)}
              className="flex items-center gap-2 text-primary hover:text-orange"
            >
              <TeamLogo name={match.awayTeam} imageUrl={match.awayTeamImage} size={36} />
              <span className="font-medium">{match.awayTeam}</span>
            </Link>
          )}
        </div>

        {match.youtube && (
          <div className="mb-8">
            <YoutubeReplayButton lang={lang} youtubeUrl={match.youtube} />
          </div>
        )}

        <p className="text-center mt-10">
          <Link
            href={`/${lang}/news`}
            className="text-sm text-primary hover:text-orange underline"
          >
            ← {t.newsTitle}
          </Link>
        </p>
      </article>
    </>
  );
}
