'use client';

import type { Lang } from '@/types';
import type { MatchRow } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface MatchesTableProps {
  lang: Lang;
  matches: MatchRow[];
}

/** 格式化比赛日期 */
function formatDate(dateStr: string, lang: Lang): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      lang === 'en' ? 'en-HK' : lang === 'zh-cn' ? 'zh-CN' : 'zh-HK',
      { month: 'short', day: 'numeric', year: 'numeric' }
    );
  } catch {
    return dateStr;
  }
}

/** 获取比赛状态显示文本 */
function getStatusText(status: string, isMatchEnd: boolean, lang: Lang): string {
  const t = UI_TEXT[lang];
  if (isMatchEnd || status === 'completed') return t.completed;
  if (status === 'in_progress' || status === 'live') return t.inProgress;
  return t.upcoming;
}

function TeamLink({
  name,
  url,
}: {
  name: string;
  url?: string;
}) {
  if (!url) return <>{name}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-orange transition-colors underline-offset-2 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </a>
  );
}

/** 赛程与结果表格 */
export default function MatchesTable({ lang, matches }: MatchesTableProps) {
  const t = UI_TEXT[lang];

  if (matches.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">{t.noData}</p>
    );
  }

  return (
    <div className="table-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-primary/10">
            <th className="text-left py-3 px-2 font-semibold text-primary w-28">
              {t.date}
            </th>
            <th className="text-left py-3 px-2 font-semibold text-primary">
              {t.match}
            </th>
            <th className="text-center py-3 px-2 font-semibold text-primary w-20">
              {t.score}
            </th>
            <th className="text-center py-3 px-2 font-semibold text-primary w-20 hidden sm:table-cell">
              {t.status}
            </th>
            <th className="text-left py-3 px-2 font-semibold text-primary hidden md:table-cell">
              {t.location}
            </th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => {
            const rowContent = (
              <>
                <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                  {formatDate(match.date, lang)}
                </td>
                <td className="py-3 px-2">
                  <div className="font-medium text-gray-700">
                    <TeamLink name={match.homeTeam} url={match.homeTeamUrl} />
                  </div>
                  <div className="text-gray-400 text-xs">vs</div>
                  <div className="font-medium text-gray-700">
                    <TeamLink name={match.awayTeam} url={match.awayTeamUrl} />
                  </div>
                </td>
                <td className="py-3 px-2 text-center">
                  {match.homeScore !== null && match.awayScore !== null ? (
                    <span className="font-bold text-primary text-base">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-2 text-center hidden sm:table-cell">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      match.isMatchEnd
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getStatusText(match.status, match.isMatchEnd, lang)}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">
                  {match.location || '-'}
                </td>
              </>
            );

            if (match.matchUrl) {
              return (
                <tr
                  key={match.id}
                  className="border-b border-gray-100 hover:bg-orange/5 transition-colors cursor-pointer"
                  onClick={() => window.open(match.matchUrl, '_blank', 'noopener,noreferrer')}
                >
                  {rowContent}
                </tr>
              );
            }

            return (
              <tr
                key={match.id}
                className="border-b border-gray-100 hover:bg-orange/5 transition-colors"
              >
                {rowContent}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
