import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { UI_TEXT } from '@/lib/i18n';
import type { Lang } from '@/types';
import { findNewsMatch } from '@/lib/match-news';
import {
  leaderLabel,
  periodLabel,
  recapMetaLine,
  recapResultSentence,
  playerLineText,
  recapPlayerParagraph,
  recapScoreTitle,
  recapStatsParagraph,
} from '@/lib/match-recap';
import { getCachedMatchBox } from '@/lib/scorelab-box';
import { teamPagePath } from '@/lib/team-links';
import { playerPagePath } from '@/lib/player-links';
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
  const box = await getCachedMatchBox(match.id);
  const statsText = box ? recapStatsParagraph(box, lang) : '';
  const playerText = box ? recapPlayerParagraph(box, lang) : '';
  const jsonLd = buildNewsArticleJsonLd(
    item,
    lang,
    [recapResultSentence(match, lang), statsText, playerText].filter(Boolean).join(' ')
  );
  const homeHead = match.homeTeamAbbreviation || match.homeTeam;
  const awayHead = match.awayTeamAbbreviation || match.awayTeam;

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
        <p className="text-lg text-gray-800 mb-4">{recapResultSentence(match, lang)}</p>
        {statsText ? <p className="text-gray-800 leading-relaxed mb-8">{statsText}</p> : null}

        {box && (box.quarters ?? []).length > 0 ? (
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">{t.recapQuarters}</h2>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="py-3 pr-4" />
                    <th className="py-3 pr-4">{homeHead}</th>
                    <th className="py-3">{awayHead}</th>
                  </tr>
                </thead>
                <tbody>
                  {(box.quarters ?? []).map((row, index) => (
                    <tr key={`q${index}`} className="border-b border-gray-50">
                      <td className="py-3 pr-4 font-medium text-primary">
                        {periodLabel('quarter', index, lang)}
                      </td>
                      <td className="py-3 pr-4 font-bold">{row.home}</td>
                      <td className="py-3 font-bold">{row.away}</td>
                    </tr>
                  ))}
                  {(box.overtime ?? []).map((row, index) => (
                    <tr key={`ot${index}`} className="border-b border-gray-50">
                      <td className="py-3 pr-4 font-medium text-primary">
                        {periodLabel('overtime', index, lang)}
                      </td>
                      <td className="py-3 pr-4 font-bold">{row.home}</td>
                      <td className="py-3 font-bold">{row.away}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 pr-4 font-medium text-primary">{t.recapTotal}</td>
                    <td className="py-3 pr-4 font-bold">{match.homeScore}</td>
                    <td className="py-3 font-bold">{match.awayScore}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-4">{t.scorelabCredit}</p>
            </div>
          </section>
        ) : null}

        {box && (box.leaders ?? []).length > 0 ? (
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">{t.recapLeaders}</h2>
            <ul className="card space-y-3">
              {(box.leaders ?? []).map((leader) => (
                <li key={leader.key} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="font-medium text-primary">{leaderLabel(leader.key, lang)}</span>
                  <span>
                    {leader.players.map((player, index) => (
                      <span key={player.playerId}>
                        {index > 0 ? (lang === 'en' ? ' and ' : '、') : null}
                        <Link
                          href={playerPagePath(lang, leagueId, player.playerId)}
                          className="text-primary hover:text-orange underline"
                        >
                          {player.jersey ? `#${player.jersey} ` : ''}
                          {player.name}
                        </Link>
                        {player.teamName
                          ? lang === 'en'
                            ? ` (${player.teamName})`
                            : `（${player.teamName}）`
                          : null}
                      </span>
                    ))}
                  </span>
                  <span className="font-bold">{leader.value}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {box && (box.teams ?? []).some((team) => team.players.length > 0) ? (
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-primary mb-4">{t.recapPlayers}</h2>
            <div className="space-y-6">
              {(box.teams ?? []).filter((team) => team.players.length > 0).map((team) => (
                <div key={team.side}>
                  <h3 className="font-heading text-lg font-bold text-primary mb-2">{team.name}</h3>
                  <ul className="space-y-2">
                    {team.players.map((player) => {
                      const who = player.jersey ? `#${player.jersey} ${player.name}` : player.name;
                      const sentence = playerLineText(player, lang);
                      const rest = sentence.startsWith(who) ? sentence.slice(who.length) : sentence;
                      return (
                        <li key={player.playerId} className="text-sm text-gray-800 leading-relaxed">
                          <Link
                            href={playerPagePath(lang, leagueId, player.playerId)}
                            className="text-primary hover:text-orange underline"
                          >
                            {who}
                          </Link>
                          {rest}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

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
