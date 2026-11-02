import type { Lang, SiteConfig } from '@/types';

/** Freddy #8 / HQ-103 首頁 H1 */
export const HOME_H1: Record<Lang, string> = {
  'zh-hk': '香港業餘籃球聯賽｜BNC League',
  'zh-cn': '香港业余篮球联赛｜BNC League',
  en: 'Hong Kong Amateur Basketball League | BNC League',
};

/** 官網「關於我們」已有句子，供 raw HTML ≥500 字元（唔發明新事實） */
export function homeIntroParagraphs(lang: Lang, config: SiteConfig): string[] {
  const subtitle = config.hero.subtitle[lang];
  if (lang === 'zh-hk') {
    return [
      subtitle,
      'BNC LEAGUE 是香港知名運動管理平台 SUPER LEARNING（suhksport.com）主辦的專業運動賽事品牌，專注舉辦各類型香港本地及大灣區競技比賽。',
      '多年來，我們已成功舉辦多屆商會、學界及企業籃球賽事，包括 BNC 籃球挑戰聯賽、OCBC 華僑銀行邀請賽、2024 鬥波！三分神射手大賽及中港籃球交流賽。',
      '本網站提供 BNC 聯賽數據、最新賽程、積分榜及比賽結果；賽事數據由 ScoreLab 提供，亦可於比賽頁查看完整賽程與賽果。',
    ];
  }
  if (lang === 'zh-cn') {
    return [
      subtitle,
      'BNC LEAGUE 是香港知名运动管理平台 SUPER LEARNING（suhksport.com）主办的专业运动赛事品牌，专注举办各类型香港本地及大湾区竞技比赛。',
      '多年来，我们已成功举办多届商会、学界及企业篮球赛事，包括 BNC 篮球挑战联赛、OCBC 华侨银行邀请赛、2024 斗波！三分神射手大赛及中港篮球交流赛。',
      '本网站提供 BNC 联赛数据、最新赛程、积分榜及比赛结果；赛事数据由 ScoreLab 提供，亦可于比赛页查看完整赛程与赛果。',
    ];
  }
  return [
    subtitle,
    'BNC LEAGUE is a professional sports event brand hosted by SUPER LEARNING (suhksport.com), dedicated to organizing local and Greater Bay Area basketball competitions in Hong Kong.',
    'We have hosted chamber, school, and corporate basketball tournaments including the BNC Basketball Challenge League, OCBC Wing Hang Bank Invitational, the 2024 Three-Point Shootout, and Hong Kong–Mainland exchange games.',
    'This site publishes BNC League schedules, standings, and results. Match data is provided via ScoreLab; see the Matches page for full fixtures and results.',
  ];
}

export function homeIntroPlainText(lang: Lang, config: SiteConfig): string {
  return homeIntroParagraphs(lang, config).join('\n\n');
}
