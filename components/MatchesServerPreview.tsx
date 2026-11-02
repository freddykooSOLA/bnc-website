import type { Lang, LeagueConfig, SeasonData } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { formatMatchDateTimeHK } from '@/lib/scorelab-helpers';

interface MatchesServerPreviewProps {
  lang: Lang;
  league: LeagueConfig;
  seasonData: SeasonData;
}

/** 賽程／賽果 SSR 預覽 — 無 JS 仍可讀 BNC 聯賽數據 */
export default function MatchesServerPreview({
  lang,
  league,
  seasonData,
}: MatchesServerPreviewProps) {
  const t = UI_TEXT[lang];
  const standings = seasonData.standings.slice(0, 12);
  const finished = seasonData.matches
    .filter((m) => m.isMatchEnd)
    .slice(0, 15);

  const dataLabel =
    lang === 'en'
      ? 'BNC League data'
      : lang === 'zh-cn'
        ? 'BNC 联赛数据'
        : 'BNC 聯賽數據';

  return (
    <div className="mb-10 space-y-8" id="bnc-league-data-ssr">
      <p className="text-sm text-gray-600">
        {dataLabel} — {league.league} {league.season}.{' '}
        <a
          href={league.url}
          className="text-primary underline-offset-2 hover:underline"
          rel="noopener noreferrer"
        >
          ScoreLab
        </a>
      </p>

      {standings.length > 0 ? (
        <div className="card overflow-x-auto">
          <h2 className="font-heading text-xl font-bold text-primary mb-4">
            {t.standings}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">{t.team}</th>
                <th className="py-2 pr-4">{t.win}</th>
                <th className="py-2">{t.loss}</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => (
                <tr key={row.teamId || row.teamName} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{index + 1}</td>
                  <td className="py-2 pr-4 font-medium text-primary">{row.teamName}</td>
                  <td className="py-2 pr-4">{row.wins}</td>
                  <td className="py-2">{row.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {finished.length > 0 ? (
        <div className="card overflow-x-auto">
          <h2 className="font-heading text-xl font-bold text-primary mb-4">
            {t.recentResultsShort}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">{t.date}</th>
                <th className="py-2 pr-4">{t.match}</th>
                <th className="py-2">{t.score}</th>
              </tr>
            </thead>
            <tbody>
              {finished.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {formatMatchDateTimeHK(m.date, lang)}
                  </td>
                  <td className="py-2 pr-4">
                    {m.homeTeam} vs {m.awayTeam}
                  </td>
                  <td className="py-2 tabular-nums">
                    {m.homeScore ?? '—'} - {m.awayScore ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
