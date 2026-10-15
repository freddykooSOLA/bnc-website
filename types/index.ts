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
    hallOfFame: LocalizedString;
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

/** ScoreLab 賽季階段 */
export interface SeasonStage {
  id: string;
  type: 'group' | 'playoff';
  name: string;
  order?: number;
}

/** 數據王球員 */
export interface TopPlayerEntry {
  name: string;
  number?: string | number;
  teamId?: string;
  teamName: string;
  teamImage?: string;
  gamesPlayed: number;
  value: number;
}

/** 积分榜行 */
export interface StandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  teamUrl?: string;
  teamImage?: string;
  teamAbbreviation?: string;
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
  youtube?: string;
  stageId?: string;
  isPlayoff?: boolean;
  isForfeit?: boolean;
  homeTeamImage?: string;
  awayTeamImage?: string;
  homeTeamAbbreviation?: string;
  awayTeamAbbreviation?: string;
}

/** ScoreLab 赛季数据 */
export interface SeasonData {
  seasonId: string;
  seasonName: string;
  standings: StandingRow[];
  matches: MatchRow[];
  seasonStages?: SeasonStage[];
  isSeasonEnd?: boolean;
  topPlayers?: Partial<Record<string, TopPlayerEntry[]>>;
}

/** YouTube 视频 */
export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}
