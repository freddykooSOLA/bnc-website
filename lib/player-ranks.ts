import type { PlayerSeasonStats } from '@/types';
import {
  STAT_LEADER_CATEGORIES,
  type StatLeaderCategory,
} from '@/lib/scorelab-helpers';

function statValue(player: PlayerSeasonStats, category: StatLeaderCategory): number {
  if (category === 'PTS') return player.PTS;
  if (category === 'REB') return player.REB;
  if (category === 'AST') return player.AST;
  if (category === 'STL') return player.STL;
  if (category === 'BLK') return player.BLK;
  if (category === '3PM') return player['3PM'];
  return player.efficiency;
}

/** 各統計項聯賽排名（1 = 最高） */
export function buildPlayerStatRanks(
  playerStats: Record<string, PlayerSeasonStats>
): Record<StatLeaderCategory, Map<string, number>> {
  const ranks = {} as Record<StatLeaderCategory, Map<string, number>>;

  for (const category of STAT_LEADER_CATEGORIES) {
    const sorted = Object.values(playerStats).sort(
      (a, b) => statValue(b, category) - statValue(a, category)
    );
    const map = new Map<string, number>();
    sorted.forEach((p, index) => {
      map.set(p.playerId, index + 1);
    });
    ranks[category] = map;
  }

  return ranks;
}

export function playerStatTotal(
  player: PlayerSeasonStats,
  category: StatLeaderCategory
): number {
  return statValue(player, category);
}

/** 從 topPlayers 條目解析 playerId 時的後備（以 name+teamId 匹配） */
export function resolvePlayerIdFromTopEntry(
  playerStats: Record<string, PlayerSeasonStats> | undefined,
  name: string,
  teamId?: string,
  playerId?: string
): string | undefined {
  if (playerId) return playerId;
  if (!playerStats) return undefined;
  const match = Object.values(playerStats).find(
    (p) => p.name === name && (!teamId || p.teamId === teamId)
  );
  return match?.playerId;
}
