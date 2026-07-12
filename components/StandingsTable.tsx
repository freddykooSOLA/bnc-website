import type { Lang } from '@/types';
import type { StandingRow } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface StandingsTableProps {
  lang: Lang;
  standings: StandingRow[];
  compact?: boolean;
}

/** 积分榜表格 */
export default function StandingsTable({
  lang,
  standings,
  compact = false,
}: StandingsTableProps) {
  const t = UI_TEXT[lang];

  if (standings.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">{t.noData}</p>
    );
  }

  const displayStandings = compact ? standings.slice(0, 5) : standings;

  return (
    <div className="table-scroll">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-primary/10">
            <th className="text-left py-3 px-2 font-semibold text-primary w-12">
              {t.rank}
            </th>
            <th className="text-left py-3 px-2 font-semibold text-primary">
              {t.team}
            </th>
            <th className="text-center py-3 px-2 font-semibold text-primary w-12">
              {t.points}
            </th>
            {!compact && (
              <>
                <th className="text-center py-3 px-2 font-semibold text-primary w-10 hidden sm:table-cell">
                  {t.win}
                </th>
                <th className="text-center py-3 px-2 font-semibold text-primary w-10 hidden sm:table-cell">
                  {t.loss}
                </th>
                <th className="text-center py-3 px-2 font-semibold text-primary w-10 hidden md:table-cell">
                  {t.draw}
                </th>
                <th className="text-center py-3 px-2 font-semibold text-primary w-12 hidden md:table-cell">
                  {t.pf}
                </th>
                <th className="text-center py-3 px-2 font-semibold text-primary w-12 hidden md:table-cell">
                  {t.pa}
                </th>
                <th className="text-center py-3 px-2 font-semibold text-primary w-12 hidden lg:table-cell">
                  {t.pd}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {displayStandings.map((row, idx) => (
            <tr
              key={row.teamId}
              className={`border-b border-gray-100 hover:bg-orange/5 transition-colors ${
                idx < 3 ? 'font-medium' : ''
              }`}
            >
              <td className="py-3 px-2">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    idx === 0
                      ? 'bg-orange text-white'
                      : idx === 1
                      ? 'bg-primary/80 text-white'
                      : idx === 2
                      ? 'bg-primary/50 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {row.rank}
                </span>
              </td>
              <td className="py-3 px-2 font-medium text-gray-700">
                {row.teamUrl ? (
                  <a
                    href={row.teamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-orange transition-colors underline-offset-2 hover:underline"
                  >
                    {row.teamName}
                  </a>
                ) : (
                  row.teamName
                )}
              </td>
              <td className="py-3 px-2 text-center font-bold text-primary">
                {row.points}
              </td>
              {!compact && (
                <>
                  <td className="py-3 px-2 text-center hidden sm:table-cell">
                    {row.wins}
                  </td>
                  <td className="py-3 px-2 text-center hidden sm:table-cell">
                    {row.losses}
                  </td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    {row.draws}
                  </td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    {row.pointsFor}
                  </td>
                  <td className="py-3 px-2 text-center hidden md:table-cell">
                    {row.pointsAgainst}
                  </td>
                  <td className="py-3 px-2 text-center hidden lg:table-cell">
                    <span
                      className={
                        row.pointsDifferential > 0
                          ? 'text-green-600'
                          : row.pointsDifferential < 0
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {row.pointsDifferential > 0 ? '+' : ''}
                      {row.pointsDifferential}
                    </span>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
