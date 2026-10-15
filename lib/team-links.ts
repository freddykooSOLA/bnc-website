import type { Lang } from '@/types';

/** 本站球隊專頁路徑 */
export function teamPagePath(lang: Lang, leagueId: string, teamId: string): string {
  return `/${lang}/teams/${leagueId}/${teamId}`;
}
