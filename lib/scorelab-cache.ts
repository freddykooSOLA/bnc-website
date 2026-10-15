import { unstable_cache } from 'next/cache';
import { fetchSeasonData } from '@/lib/scorelab';
import type { SeasonData } from '@/types';

const REVALIDATE_SECONDS = 300;

/** 帶 300 秒 ISR 快取的賽季資料（server 用） */
export function getCachedSeasonData(seasonUrl: string): Promise<SeasonData> {
  return unstable_cache(
    async () => fetchSeasonData(seasonUrl),
    ['scorelab-season', seasonUrl],
    { revalidate: REVALIDATE_SECONDS }
  )();
}
