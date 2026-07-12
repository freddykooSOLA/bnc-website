/** 支持的语言代码 */
export type Lang = 'zh-hk' | 'zh-cn' | 'en';

/** 三语本地化字符串 */
export type LocalizedString = Record<Lang, string>;

/** 联赛/赛季配置 */
export interface LeagueConfig {
  id: string;
  league: string;
  season: string;
  url: string;
}

/** 站点配置结构 */
export interface SiteConfig {
  siteName: LocalizedString;
  logo: string;
  favicon: string;
  defaultLang: Lang;
  contact: {
    phone: string;
    email: string;
    address: LocalizedString;
    googleMapEmbedUrl: string;
  };
  socialLinks: {
    youtube: string;
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
  nav: {
    home: LocalizedString;
    about: LocalizedString;
    matches: LocalizedString;
  };
  hero: {
    title: LocalizedString;
    subtitle: LocalizedString;
    ctaText: LocalizedString;
    backgroundImage: string;
  };
  about: {
    content: LocalizedString;
  };
  matches: {
    showArchive: boolean;
    defaultLeagueId: string;
    leagues: LeagueConfig[];
    archiveLeagues: LeagueConfig[];
  };
  footer: {
    copyright: LocalizedString;
  };
  seo: {
    home: { title: LocalizedString; description: LocalizedString; keywords: LocalizedString };
    about: { title: LocalizedString; description: LocalizedString };
    matches: { title: LocalizedString; description: LocalizedString };
  };
}

/** 积分榜行 */
export interface StandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  teamUrl?: string;
  teamImage?: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifferential: number;
  matchesPlayed: number;
}

/** 比赛行 */
export interface MatchRow {
  id: string;
  matchUrl?: string;
  date: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamUrl?: string;
  awayTeamUrl?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  location: string;
  isMatchEnd: boolean;
}

/** ScoreLab 赛季数据 */
export interface SeasonData {
  seasonId: string;
  seasonName: string;
  standings: StandingRow[];
  matches: MatchRow[];
}

/** YouTube 视频 */
export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}
