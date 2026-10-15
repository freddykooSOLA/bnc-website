'use client';

import type { Lang, TopPlayerEntry } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import {
  STAT_LEADER_CATEGORIES,
  type StatLeaderCategory,
  statCategoryLabel,
} from '@/lib/scorelab-helpers';

interface TeamStatLeadersProps {
  lang: Lang;
  byCategory: Partial<Record<string, TopPlayerEntry[]>>;
}

function formatAvg(total: number, games: number): string {
  if (!games) return '—';
  return (total / games).toFixed(1);
}

export default function TeamStatLeaders({ lang, byCategory }: TeamStatLeadersProps) {
  const t = UI_TEXT[lang];
  const categories = STAT_LEADER_CATEGORIES.filter(
    (c) => (byCategory[c]?.length ?? 0) > 0
  );

  if (categories.length === 0) {
    return <p className="text-gray-500 text-center py-6">{t.noData}</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => {
        const entries = (byCategory[cat] ?? []).slice(0, 3);
        return (
          <div key={cat} className="rounded-lg bg-light-bg border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-orange mb-3">
              {statCategoryLabel(cat as StatLeaderCategory, lang)}
            </h3>
            <ol className="space-y-2">
              {entries.map((p, i) => (
                <li key={`${p.name}-${i}`} className="flex justify-between gap-2 text-sm">
                  <span className="text-gray-700 truncate">
                    <span className="text-gray-400 mr-1">{i + 1}.</span>
                    {p.number != null && p.number !== '' ? `#${p.number} ` : ''}
                    {p.name}
                  </span>
                  <span className="font-bold text-primary shrink-0">
                    {p.value}{' '}
                    <span className="text-xs font-normal text-gray-400">
                      ({formatAvg(p.value, p.gamesPlayed)} {t.perGame})
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
