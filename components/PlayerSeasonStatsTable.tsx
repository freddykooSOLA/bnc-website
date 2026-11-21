import type { Lang } from '@/types';
import type { PlayerSeasonStats } from '@/types';
import {
  STAT_LEADER_CATEGORIES,
  statCategoryLabel,
  type StatLeaderCategory,
} from '@/lib/scorelab-helpers';
import { playerStatTotal } from '@/lib/player-ranks';
import { UI_TEXT } from '@/lib/i18n';

function formatAvg(total: number, games: number): string {
  if (!games) return '—';
  return (total / games).toFixed(1);
}

export default function PlayerSeasonStatsTable({
  lang,
  player,
  ranks,
}: {
  lang: Lang;
  player: PlayerSeasonStats;
  ranks: Record<StatLeaderCategory, Map<string, number>> | null;
}) {
  const t = UI_TEXT[lang];

  return (
  <div className="max-w-full">
    <ul className="sm:hidden space-y-2 text-base">
      {STAT_LEADER_CATEGORIES.map((cat) => {
        const total = playerStatTotal(player, cat as StatLeaderCategory);
        const rank = ranks?.[cat as StatLeaderCategory]?.get(player.playerId);
        return (
          <li key={cat} className="border border-gray-100 rounded-lg p-3 space-y-1">
            <p className="font-medium text-primary">
              {statCategoryLabel(cat as StatLeaderCategory, lang)}
            </p>
            <p className="text-gray-700">
              {t.seasonTotals} {total} · {t.seasonAvg} {formatAvg(total, player.gamesPlayed)}
            </p>
            <p className="text-gray-600 text-sm">
              {t.leagueRank}{' '}
              {rank ? t.rankNth.replace('{n}', String(rank)) : '—'}
            </p>
          </li>
        );
      })}
    </ul>
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm min-w-0">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="py-3 pr-4">{t.statLeaders}</th>
            <th className="py-3 pr-4">{t.seasonTotals}</th>
            <th className="py-3 pr-4">{t.seasonAvg}</th>
            <th className="py-3">{t.leagueRank}</th>
          </tr>
        </thead>
        <tbody>
          {STAT_LEADER_CATEGORIES.map((cat) => {
            const total = playerStatTotal(player, cat as StatLeaderCategory);
            const rank = ranks?.[cat as StatLeaderCategory]?.get(player.playerId);
            return (
              <tr key={cat} className="border-b border-gray-50">
                <td className="py-3 pr-4 font-medium text-primary">
                  {statCategoryLabel(cat as StatLeaderCategory, lang)}
                </td>
                <td className="py-3 pr-4 font-bold">{total}</td>
                <td className="py-3 pr-4 text-gray-600">
                  {formatAvg(total, player.gamesPlayed)}
                </td>
                <td className="py-3 text-gray-600">
                  {rank ? t.rankNth.replace('{n}', String(rank)) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
  );
}