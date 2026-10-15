import type { Lang } from '@/types';

/**
 * ScoreLab `matchDate` quirk: values look like UTC ISO strings (trailing "Z") but the
 * date/time components are Hong Kong wall-clock, not true UTC. Example:
 * `2026-10-23T21:00:00.000Z` means tip-off at 21:00 HKT on Oct 23, not 21:00 UTC.
 *
 * Display those components with `timeZone: 'UTC'` (do not use Asia/Hong_Kong — that adds +8 again).
 * For sorting and countdown, use `toRealEpoch()` to convert to real Unix milliseconds.
 */

const HK_WALL_CLOCK_OFFSET_MS = 8 * 3600 * 1000;

/** True Unix ms for a ScoreLab matchDate string. */
export function toRealEpoch(dateStr: string): number {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return 0;
  return parsed - HK_WALL_CLOCK_OFFSET_MS;
}

export function compareMatchDateAsc(a: string, b: string): number {
  return toRealEpoch(a) - toRealEpoch(b);
}

export function compareMatchDateDesc(a: string, b: string): number {
  return toRealEpoch(b) - toRealEpoch(a);
}

/** Wall-clock date + time as stored in ScoreLab (shown as HKT tip-off). */
export function formatMatchDateTimeHK(dateStr: string, lang: Lang): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const locale =
      lang === 'en' ? 'en-HK' : lang === 'zh-cn' ? 'zh-CN' : 'zh-HK';
    return date.toLocaleString(locale, {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: lang === 'en',
    });
  } catch {
    return dateStr;
  }
}

/** Wall-clock date only (table date column). */
export function formatMatchDateHK(dateStr: string, lang: Lang): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      lang === 'en' ? 'en-HK' : lang === 'zh-cn' ? 'zh-CN' : 'zh-HK',
      { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
    );
  } catch {
    return dateStr;
  }
}
