import type { LocalizedString } from '@/types';

/** 示例活動。日期、地點與名額都不是正式公布。 */
export interface LeagueEvent {
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  startsAt: string;
  registerBy: string;
  /** 示例名額，非正式公布。未設定則不限制。 */
  capacity?: number;
  location: LocalizedString;
  feeNote: LocalizedString;
}

export const LEAGUE_EVENTS: LeagueEvent[] = [
  {
    slug: 'three-point-sample',
    title: {
      'zh-hk': '三分球示範活動',
      'zh-cn': '三分球示范活动',
      en: 'Three-point sample session',
    },
    summary: {
      'zh-hk': '給球員試用報名與簽到流程的示例活動。這不是已公布的正式賽事。',
      'zh-cn': '给球员试用报名与签到流程的示例活动。这不是已公布的正式赛事。',
      en: 'A sample session so players can try registration and check-in. This is not a published fixture.',
    },
    startsAt: '2026-10-18T14:00:00+08:00',
    registerBy: '2026-10-16T23:59:00+08:00',
    capacity: 2,
    location: {
      'zh-hk': '場地待確認',
      'zh-cn': '场地待确认',
      en: 'Venue to be confirmed',
    },
    feeNote: {
      'zh-hk': '費用待確認',
      'zh-cn': '费用待确认',
      en: 'Fee to be confirmed',
    },
  },
  {
    slug: 'bnc-league-sample',
    title: {
      'zh-hk': 'BNC 聯賽示例報名',
      'zh-cn': 'BNC 联赛示例报名',
      en: 'BNC league sample registration',
    },
    summary: {
      'zh-hk': '示範以隊名報名一場 BNC 聯賽相關活動。賽程仍以比賽頁的 ScoreLab 為準。',
      'zh-cn': '示范以队名报名一场 BNC 联赛相关活动。赛程仍以比赛页的 ScoreLab 为准。',
      en: 'Shows team-name registration for a BNC-related activity. The live schedule stays on the matches page via ScoreLab.',
    },
    startsAt: '2026-11-08T10:00:00+08:00',
    registerBy: '2026-11-05T23:59:00+08:00',
    capacity: 16,
    location: {
      'zh-hk': '場地待確認',
      'zh-cn': '场地待确认',
      en: 'Venue to be confirmed',
    },
    feeNote: {
      'zh-hk': '費用待確認',
      'zh-cn': '费用待确认',
      en: 'Fee to be confirmed',
    },
  },
  {
    slug: 'ocbc-invitational-sample',
    title: {
      'zh-hk': 'OCBC 邀請賽示例報名',
      'zh-cn': 'OCBC 邀请赛示例报名',
      en: 'OCBC invitational sample registration',
    },
    summary: {
      'zh-hk': '示範邀請賽報名表。正式隊數、日期與場地需營運另行確認後才會替換此示例。',
      'zh-cn': '示范邀请赛报名表。正式队数、日期与场地需营运另行确认后才会替换此示例。',
      en: 'Sample invitational form. Official teams, dates, and venues replace this only after the operator confirms them.',
    },
    startsAt: '2026-12-05T09:30:00+08:00',
    registerBy: '2026-12-01T23:59:00+08:00',
    capacity: 8,
    location: {
      'zh-hk': '場地待確認',
      'zh-cn': '场地待确认',
      en: 'Venue to be confirmed',
    },
    feeNote: {
      'zh-hk': '費用待確認',
      'zh-cn': '费用待确认',
      en: 'Fee to be confirmed',
    },
  },
  {
    slug: 'registration-closed-sample',
    title: {
      'zh-hk': '已截止報名示例',
      'zh-cn': '已截止报名示例',
      en: 'Registration closed sample',
    },
    summary: {
      'zh-hk': '示例：報名截止時間已過，用於展示截止後無法再報名。',
      'zh-cn': '示例：报名截止时间已过，用于展示截止后无法再报名。',
      en: 'Sample activity whose registration deadline has passed, for demonstrating closed sign-up.',
    },
    startsAt: '2026-10-10T10:00:00+08:00',
    registerBy: '2026-10-01T23:59:00+08:00',
    capacity: 4,
    location: {
      'zh-hk': '場地待確認',
      'zh-cn': '场地待确认',
      en: 'Venue to be confirmed',
    },
    feeNote: {
      'zh-hk': '費用待確認',
      'zh-cn': '费用待确认',
      en: 'Fee to be confirmed',
    },
  },
];

export function getEvent(slug: string) {
  return LEAGUE_EVENTS.find((event) => event.slug === slug) || null;
}

export function isRegistrationOpen(event: LeagueEvent, now: Date = new Date()) {
  return now.getTime() <= new Date(event.registerBy).getTime();
}

export function isEventFull(event: LeagueEvent, registeredCount: number) {
  if (event.capacity == null) return false;
  return registeredCount >= event.capacity;
}

export function spotsRemaining(event: LeagueEvent, registeredCount: number) {
  if (event.capacity == null) return null;
  return Math.max(0, event.capacity - registeredCount);
}
