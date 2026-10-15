import type { Lang, MatchRow, SeasonStage } from '@/types';

/** 從 YouTube URL 解析 video id */
export function parseYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    const short = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short) return short[1];
    const watch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch) return watch[1];
    const embed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed) return embed[1];
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

const STAGE_NAME_MAP: Record<string, Record<Lang, string>> = {
  'regular season': {
    'zh-hk': '常規賽',
    'zh-cn': '常规赛',
    en: 'Regular Season',
  },
  'post-season': {
    'zh-hk': '季後賽',
    'zh-cn': '季后赛',
    en: 'Playoffs',
  },
  playoffs: {
    'zh-hk': '季後賽',
    'zh-cn': '季后赛',
    en: 'Playoffs',
  },
};

/** season stage 顯示名稱（三語對應或原名） */
export function getStageDisplayName(stageName: string, lang: Lang): string {
  const key = stageName.trim().toLowerCase();
  const mapped = STAGE_NAME_MAP[key];
  if (mapped) return mapped[lang];
  return stageName;
}

/** 香港時區開賽時間 */
export function formatMatchDateTimeHK(dateStr: string, lang: Lang): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const locale =
      lang === 'en' ? 'en-HK' : lang === 'zh-cn' ? 'zh-CN' : 'zh-HK';
    return date.toLocaleString(locale, {
      timeZone: 'Asia/Hong_Kong',
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

/** 季後賽段在上，其餘按 order */
export function sortSeasonStages(stages: SeasonStage[]): SeasonStage[] {
  return [...stages].sort((a, b) => {
    const aPlayoff = a.type === 'playoff' ? 0 : 1;
    const bPlayoff = b.type === 'playoff' ? 0 : 1;
    if (aPlayoff !== bPlayoff) return aPlayoff - bPlayoff;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

export interface MatchStageGroup {
  stageId: string | null;
  title: string;
  matches: MatchRow[];
}

/** 依 seasonStages 分組；無 stages 則單一列表 */
export function groupMatchesByStage(
  matches: MatchRow[],
  stages: SeasonStage[] | undefined,
  lang: Lang
): MatchStageGroup[] {
  if (!stages || stages.length === 0) {
    return [{ stageId: null, title: '', matches }];
  }

  const sorted = sortSeasonStages(stages);
  const byStage = new Map<string, MatchRow[]>();
  for (const s of sorted) {
    byStage.set(s.id, []);
  }
  const unassigned: MatchRow[] = [];

  for (const m of matches) {
    if (m.stageId && byStage.has(m.stageId)) {
      byStage.get(m.stageId)!.push(m);
    } else {
      unassigned.push(m);
    }
  }

  const groups: MatchStageGroup[] = sorted.map((s) => ({
    stageId: s.id,
    title: getStageDisplayName(s.name, lang),
    matches: byStage.get(s.id) ?? [],
  }));

  if (unassigned.length > 0) {
    groups.push({ stageId: null, title: '', matches: unassigned });
  }

  return groups.filter((g) => g.matches.length > 0);
}

export const STAT_LEADER_CATEGORIES = [
  'PTS',
  'REB',
  'AST',
  'STL',
  'BLK',
  'efficiency',
  '3PM',
] as const;

export type StatLeaderCategory = (typeof STAT_LEADER_CATEGORIES)[number];

export function statCategoryLabel(category: StatLeaderCategory, lang: Lang): string {
  const labels: Record<StatLeaderCategory, Record<Lang, string>> = {
    PTS: { 'zh-hk': '得分', 'zh-cn': '得分', en: 'Points' },
    REB: { 'zh-hk': '籃板', 'zh-cn': '篮板', en: 'Rebounds' },
    AST: { 'zh-hk': '助攻', 'zh-cn': '助攻', en: 'Assists' },
    STL: { 'zh-hk': '抄截', 'zh-cn': '抢断', en: 'Steals' },
    BLK: { 'zh-hk': '封阻', 'zh-cn': '封盖', en: 'Blocks' },
    efficiency: { 'zh-hk': '效率', 'zh-cn': '效率', en: 'Efficiency' },
    '3PM': { 'zh-hk': '三分命中', 'zh-cn': '三分命中', en: '3PM' },
  };
  return labels[category][lang];
}

export function getPlayerStatValue(
  player: Record<string, unknown>,
  category: StatLeaderCategory
): number {
  const raw = player[category];
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  return 0;
}
