import type { LeagueConfig, SiteConfig } from '@/types';

export interface MatchesLeagueLists {
  latest: LeagueConfig[];
  archive: LeagueConfig[];
}

/** 依 archiveLeagues 設定拆分（config-only；賽季結束狀態由客戶端切換聯賽時載入） */
export async function resolveMatchesLeagueLists(
  config: SiteConfig
): Promise<MatchesLeagueLists> {
  const manualArchiveIds = new Set(
    config.matches.archiveLeagues.map((l) => l.id)
  );
  const latest = config.matches.leagues.filter(
    (l) => !manualArchiveIds.has(l.id)
  );
  const archive = [
    ...config.matches.archiveLeagues,
    ...config.matches.leagues.filter((l) => manualArchiveIds.has(l.id)),
  ];
  return { latest, archive };
}
