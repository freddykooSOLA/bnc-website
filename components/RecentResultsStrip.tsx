import type { Lang, MatchRow } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import TeamLogo from './TeamLogo';

interface RecentResultsStripProps {
  lang: Lang;
  matches: MatchRow[];
}

/** 最近賽果條 */
export default function RecentResultsStrip({ lang, matches }: RecentResultsStripProps) {
  const t = UI_TEXT[lang];

  if (matches.length === 0) return null;

  return (
    <div className="card">
      <h2 className="font-heading text-lg font-bold text-primary mb-4">
        {t.recentResultsShort}
      </h2>
      <ul className="space-y-3">
        {matches.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 text-sm min-w-0"
          >
            <TeamLogo
              name={m.homeTeam}
              imageUrl={m.homeTeamImage}
              abbreviation={m.homeTeamAbbreviation}
              size={24}
            />
            <span className="truncate font-medium text-gray-700 min-w-0 flex-1">
              {m.homeTeam}
            </span>
            <span className="font-bold text-primary shrink-0 px-1">
              {m.homeScore ?? '-'} - {m.awayScore ?? '-'}
            </span>
            <span className="truncate font-medium text-gray-700 min-w-0 flex-1 text-right">
              {m.awayTeam}
            </span>
            <TeamLogo
              name={m.awayTeam}
              imageUrl={m.awayTeamImage}
              abbreviation={m.awayTeamAbbreviation}
              size={24}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
