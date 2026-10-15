import type { LeagueConfig, SiteConfig } from '@/types';
import { getCachedSeasonData } from '@/lib/scorelab-cache';

export interface MatchesLeagueLists {
  latest: LeagueConfig[];
  archive: LeagueConfig[];
}

/** 依 isSeasonEnd 與 archiveLeagues 手動覆寫拆分最新／往期 */
export async function resolveMatchesLeagueLists(
  config: SiteConfig
): Promise<MatchesLeagueLists> {
  const manualArchiveIds = new Set(
    config.matches.archiveLeagues.map((l) => l.id)
  );
  const configured = config.matches.leagues;
  const manualArchive = config.matches.archiveLeagues;

  const seasonEndById = new Map<string, boolean>();
  await Promise.all(
    configured.map(async (league) => {
      try {
        const data = await getCachedSeasonData(league.url);
        seasonEndById.set(league.id, data.isSeasonEnd === true);
      } catch {
        seasonEndById.set(league.id, false);
      }
    })
  );

  const latest: LeagueConfig[] = [];
  const archive: LeagueConfig[] = [...manualArchive];
  const archiveIds = new Set(manualArchive.map((l) => l.id));

  for (const league of configured) {
    if (manualArchiveIds.has(league.id) || seasonEndById.get(league.id)) {
      if (!archiveIds.has(league.id)) {
        archive.push(league);
        archiveIds.add(league.id);
      }
    } else {
      latest.push(league);
    }
  }

  return { latest, archive };
}
