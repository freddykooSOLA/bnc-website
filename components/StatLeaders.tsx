'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lang, TopPlayerEntry } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { teamPagePath } from '@/lib/team-links';
import {
  STAT_LEADER_CATEGORIES,
  type StatLeaderCategory,
  statCategoryLabel,
} from '@/lib/scorelab-helpers';
import TeamLogo from './TeamLogo';

interface StatLeadersProps {
  lang: Lang;
  topPlayers: Partial<Record<string, TopPlayerEntry[]>> | undefined;
  compact?: boolean;
  leagueId?: string;
}

function formatAvg(total: number, games: number): string {
  if (!games) return '—';
  return (total / games).toFixed(1);
}

function LeadersList({
  lang,
  entries,
  limit,
  leagueId,
}: {
  lang: Lang;
  entries: TopPlayerEntry[];
  limit: number;
  leagueId?: string;
}) {
  const t = UI_TEXT[lang];
  const list = entries.slice(0, limit);

  if (list.length === 0) {
    return <p className="text-gray-500 text-sm py-4 text-center">{t.noData}</p>;
  }

  return (
    <ol className="space-y-3">
      {list.map((p, i) => (
        <li key={`${p.name}-${p.teamId}-${i}`} className="flex items-center gap-3">
          <span className="w-6 text-center text-xs font-bold text-gray-400">
            {i + 1}
          </span>
          <TeamLogo
            name={p.teamName}
            imageUrl={p.teamImage}
            size={28}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-800 text-sm truncate">
              {p.number != null && p.number !== '' ? `#${p.number} ` : ''}
              {p.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {leagueId && p.teamId ? (
                <Link
                  href={teamPagePath(lang, leagueId, p.teamId)}
                  className="hover:text-orange transition-colors"
                >
                  {p.teamName}
                </Link>
              ) : (
                p.teamName
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-primary">{p.value}</div>
            <div className="text-xs text-gray-400">
              {formatAvg(p.value, p.gamesPlayed)} {t.perGame}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** 數據王排行榜 */
export default function StatLeaders({
  lang,
  topPlayers,
  compact = false,
  leagueId,
}: StatLeadersProps) {
  const t = UI_TEXT[lang];
  const [category, setCategory] = useState<StatLeaderCategory>('PTS');

  const available = STAT_LEADER_CATEGORIES.filter(
    (c) => (topPlayers?.[c]?.length ?? 0) > 0
  );

  if (available.length === 0) return null;

  if (compact) {
    const compactCats: StatLeaderCategory[] = ['PTS', 'REB', 'AST'].filter((c) =>
      available.includes(c as StatLeaderCategory)
    ) as StatLeaderCategory[];

    if (compactCats.length === 0) return null;

    return (
      <div className="card">
        <h2 className="font-heading text-lg font-bold text-primary mb-4">
          {t.statLeaders}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {compactCats.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-orange mb-2">
                {statCategoryLabel(cat, lang)}
              </h3>
              <LeadersList
                lang={lang}
                entries={topPlayers![cat] ?? []}
                limit={3}
                leagueId={leagueId}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const active = available.includes(category) ? category : available[0];

  return (
    <div className="card">
      <h2 className="font-heading text-xl font-bold text-primary mb-4">
        {t.statLeaders}
      </h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {available.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              active === cat
                ? 'bg-orange text-white'
                : 'bg-gray-100 text-primary hover:bg-orange/10'
            }`}
          >
            {statCategoryLabel(cat, lang)}
          </button>
        ))}
      </div>
      <LeadersList
        lang={lang}
        entries={topPlayers![active] ?? []}
        limit={5}
        leagueId={leagueId}
      />
    </div>
  );
}
