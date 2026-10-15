import type { Lang } from '@/types';

/** 本站球員專頁路徑 */
export function playerPagePath(
  lang: Lang,
  leagueId: string,
  playerId: string
): string {
  return `/${lang}/players/${leagueId}/${playerId}`;
}
