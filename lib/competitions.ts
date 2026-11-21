import type { Lang, LocalizedString } from '@/types';

export interface Competition {
  slug: string;
  title: LocalizedString;
  shortTitle: LocalizedString;
  dateRange: LocalizedString;
  schedule: LocalizedString;
  venue: LocalizedString;
  category: LocalizedString;
  prizes: LocalizedString;
  individualAwards: LocalizedString;
  registerBy: string;
  rosterBy: string;
  fee: LocalizedString;
  chequePayee: LocalizedString;
  howToEnter: LocalizedString[];
  format: LocalizedString;
  tieBreak: LocalizedString;
  advancement: LocalizedString;
  notices: LocalizedString[];
  contactPhone: string;
  contactEmail: string;
  organizer: LocalizedString;
  organizerDate: string;
  dateDisclaimer: LocalizedString;
  downloadPath: string;
}

const YINYUAN_SLUG = 'yinyuan-cup-2027';

export const COMPETITIONS: Competition[] = [
  {
    slug: YINYUAN_SLUG,
    title: {
      'zh-hk': '第一屆【銀員盃】籃球邀請賽 5 人籃球比賽',
      'zh-cn': '第一届【银员杯】篮球邀请赛 5 人篮球比赛',
      en: '1st Yinyuan Cup Invitational — 5-on-5 Basketball',
    },
    shortTitle: {
      'zh-hk': '銀員盃 2027',
      'zh-cn': '银员杯 2027',
      en: 'Yinyuan Cup 2027',
    },
    dateRange: {
      'zh-hk': '2027 年 3 月至 10 月',
      'zh-cn': '2027 年 3 月至 10 月',
      en: 'March–October 2027',
    },
    schedule: {
      'zh-hk': '星期一至五晚上 9:00–11:00',
      'zh-cn': '星期一至五晚上 9:00–11:00',
      en: 'Monday–Friday, 9:00–11:00 pm',
    },
    venue: {
      'zh-hk': '賽前 7 日公佈地點',
      'zh-cn': '赛前 7 日公布地点',
      en: 'Venue announced 7 days before each game',
    },
    category: {
      'zh-hk': '男子組',
      'zh-cn': '男子组',
      en: 'Men’s division',
    },
    prizes: {
      'zh-hk':
        '正賽組冠、亞、季及殿軍可獲獎盃一個，得獎隊員連後備各可獲獎牌一面。\n另設銀杯賽冠、亞、季及殿軍可獲獎盃一個，得獎隊員連後備各可獲獎牌一面。\n另設銀碟賽冠及亞軍可獲獎盃一個，得獎隊員連後備各可獲獎牌一面。',
      'zh-cn':
        '正赛组冠、亚、季及殿军可获奖杯一个，得奖队员连后备各可获奖牌一面。\n另设银杯赛冠、亚、季及殿军可获奖杯一个，得奖队员连后备各可获奖牌一面。\n另设银碟赛冠及亚军可获奖杯一个，得奖队员连后备各可获奖牌一面。',
      en:
        'Main draw: trophies for 1st–4th; medals for players and reserves.\nSilver Cup: trophies for 1st–4th; medals for players and reserves.\nSilver Plate: trophies for 1st–2nd; medals for players and reserves.',
    },
    individualAwards: {
      'zh-hk':
        '個人獎項設「三分王」、「籃板王」、「得分王」、「封阻王」及「助攻王」，各獲獎盃一個（計算全部賽事成績）。',
      'zh-cn':
        '个人奖项设「三分王」、「篮板王」、「得分王」、「封阻王」及「助攻王」，各获奖杯一个（计算全部赛事成绩）。',
      en:
        'Individual awards: Three-Point King, Rebound King, Scoring King, Block King, and Assist King — one trophy each (all games counted).',
    },
    registerBy: '2026-12-31',
    rosterBy: '2027-01-31',
    fee: {
      'zh-hk': '每間會員銀行 HK$10,000（最多 7 場比賽）',
      'zh-cn': '每间会员银行 HK$10,000（最多 7 场比赛）',
      en: 'HK$10,000 per member bank (up to 7 games)',
    },
    chequePayee: {
      'zh-hk': '劃線支票抬頭「Superlearning (Hong Kong) Limited」',
      'zh-cn': '划线支票抬头「Superlearning (Hong Kong) Limited」',
      en: 'Crossed cheque payable to “Superlearning (Hong Kong) Limited”',
    },
    howToEnter: [
      {
        'zh-hk':
          '將已填妥的報名表經電郵 superlearninghkltd@gmail.com 或網上報名提交。所填資料必須全部屬實；虛報資料者將被取消所有參加資格。',
        'zh-cn':
          '将已填妥的报名表经电邮 superlearninghkltd@gmail.com 或网上报名提交。所填资料必须全部属实；虚报资料者将被取消所有参加资格。',
        en:
          'Submit a completed form by email to superlearninghkltd@gmail.com or via online registration. All information must be true; false entries may be disqualified.',
      },
      {
        'zh-hk': '大會保留拒絕任何參加者參加的權利。',
        'zh-cn': '大会保留拒绝任何参加者参加的权利。',
        en: 'The organiser reserves the right to refuse any entry.',
      },
    ],
    format: {
      'zh-hk': '預計 10 隊參賽，分兩組，採單循環，每隊 4 場小組賽；勝 3 分、和 1 分、負 0 分。',
      'zh-cn': '预计 10 队参赛，分两组，采单循环，每队 4 场小组赛；胜 3 分、和 1 分、负 0 分。',
      en: '10 teams in two groups, round-robin (4 games each); win 3 pts, tie 1 pt, loss 0 pts.',
    },
    tieBreak: {
      'zh-hk':
        '小組同分時，依序以：隊伍相互對賽往績（勝者為先）→ 總得分較高者 → 總失分較少者 → 得失分差較少者 → 抽籤決定。',
      'zh-cn':
        '小组同分时，依序以：队伍相互对赛往绩（胜者为先）→ 总得分较高者 → 总失分较少者 → 得失分差较少者 → 抽签决定。',
      en:
        'Tie-break order: head-to-head → points scored → points allowed → point differential → draw.',
    },
    advancement: {
      'zh-hk':
        '小組賽後晉級：上線為正賽組冠亞季殿，下線為銀杯組冠亞季殿，第九、十名為銀碟組冠亞軍。',
      'zh-cn':
        '小组赛后晋级：上线为正赛组冠亚季殿，下线为银杯组冠亚季殿，第九、十名为银碟组冠亚军。',
      en:
        'After groups: top bracket = main draw (1st–4th); lower bracket = Silver Cup (1st–4th); 9th–10th = Silver Plate final.',
    },
    notices: [
      {
        'zh-hk': '每位球員只可代表一隊作賽；比賽期間代表另一隊參賽，所代表隊伍均被取消資格及所有成績。',
        'zh-cn': '每位球员只可代表一队作赛；比赛期间代表另一队参赛，所代表队伍均被取消资格及所有成绩。',
        en: 'Each player may play for one team only; playing for another team voids that team’s results.',
      },
      {
        'zh-hk':
          '各球隊須具備兩套不同深淺顏色及合規球衣；主隊淺色、客隊深色。球衣同色時由球證決定更換。球衣號碼須與出場表一致，0–99 號，同隊不得重複。',
        'zh-cn':
          '各球队须具备两套不同深浅颜色及合规球衣；主队浅色、客队深色。球衣同色时由球证决定更换。球衣号码须与出场表一致，0–99 号，同队不得重复。',
        en:
          'Two light/dark kits; home light, away dark. Numbers 0–99 on the roster, unique per team.',
      },
      {
        'zh-hk': '各球隊須核對賽程、場地、日期及時間，於開賽前 15 分鐘向賽會報到。',
        'zh-cn': '各球队须核对赛程、场地、日期及时间，于开赛前 15 分钟向赛会报到。',
        en: 'Check fixtures and report 15 minutes before tip-off.',
      },
      {
        'zh-hk':
          '開賽前 15 分鐘，球員須親身攜身份證明文件或行員證（正本）及已填出場表交工作人員及球證核對；資料不符一律不得作賽。',
        'zh-cn':
          '开赛前 15 分钟，球员须亲身携身份证明文件或行员证（正本）及已填出场表交工作人员及球证核对；资料不符一律不得作赛。',
        en: 'Bring ID or staff card and lineup sheet 15 minutes before game; mismatches cannot play.',
      },
      {
        'zh-hk': '開賽時隊伍不足 5 人，判輸 20:0；比賽時間以球證手錶為準。',
        'zh-cn': '开赛时队伍不足 5 人，判输 20:0；比赛时间以球证手表为准。',
        en: 'Fewer than 5 players at tip-off = forfeit 20–0; official’s watch is the clock.',
      },
      {
        'zh-hk': '非報名球員參賽，該隊資格及成績取消；賽會可要求出示身份證明文件。',
        'zh-cn': '非报名球员参赛，该队资格及成绩取消；赛会可要求出示身份证明文件。',
        en: 'Unlisted players void the team’s entry; ID may be requested.',
      },
      {
        'zh-hk': '嚴重犯規、違反規則或不君子行為，裁判可取消該隊資格及一切成績。',
        'zh-cn': '严重犯规、违反规则或不君子行为，裁判可取消该队资格及一切成绩。',
        en: 'Serious misconduct may disqualify a team.',
      },
      {
        'zh-hk': '賽會不設上訴；賽果以裁判最後判決為準。',
        'zh-cn': '赛会不设上诉；赛果以裁判最后判决为准。',
        en: 'No appeals; officials’ decisions are final.',
      },
      {
        'zh-hk':
          '球員須穿適當服裝及運動鞋，遵守《遊樂場地規例》及場地管理人員指示。',
        'zh-cn': '球员须穿适当服装及运动鞋，遵守《游乐场法规例》及场地管理人员指示。',
        en: 'Appropriate kit and footwear; follow venue rules and staff directions.',
      },
      {
        'zh-hk':
          '比賽當日如天文台於首輪報到前兩小時已發出八號預警、仍懸八號或以上熱帶氣旋信號或黑色暴雨警告，該日賽事取消，安排另行通知。',
        'zh-cn':
          '比赛当日如天文台于首轮报到前两小时已发出八号预警、仍悬八号或以上热带气旋信号或黑色暴雨警告，该日赛事取消，安排另行通知。',
        en:
          'Games cancel if T8 pre-warning, T8+, or Black Rain is in force before first check-in; rescheduling announced later.',
      },
      {
        'zh-hk': '建議各參加銀行為參賽職員購買相關保險。',
        'zh-cn': '建议各参加银行为参赛职员购买相关保险。',
        en: 'Banks are advised to arrange insurance for participating staff.',
      },
      {
        'zh-hk': '本章程如有未盡善處，賽會有權隨時作出修改。',
        'zh-cn': '本章程如有未尽善处，赛会有权随时作出修改。',
        en: 'The organiser may amend these rules at any time.',
      },
    ],
    contactPhone: '61016161',
    contactEmail: 'superlearninghkltd@gmail.com',
    organizer: {
      'zh-hk': 'Superlearning (Hong Kong) Limited',
      'zh-cn': 'Superlearning (Hong Kong) Limited',
      en: 'Superlearning (Hong Kong) Limited',
    },
    organizerDate: '2026-11-21',
    dateDisclaimer: {
      'zh-hk': '部分日期以主辦最後公布為準。',
      'zh-cn': '部分日期以主办最后公布为准。',
      en: 'Some dates are subject to final confirmation by the organiser.',
    },
    downloadPath: '/downloads/yinyuan-cup-2027-entry-form.docx',
  },
];

export function getCompetition(slug: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.slug === slug);
}

export function listFeaturedCompetitions(): Competition[] {
  return COMPETITIONS;
}

export function competitionRegisterPath(slug: string, lang: Lang): string {
  return `/${lang}/competitions/${slug}/register`;
}

export function competitionDetailPath(slug: string, lang: Lang): string {
  return `/${lang}/competitions/${slug}`;
}

export const COMPETITION_UI: Record<
  Lang,
  {
    back: string;
    downloadForm: string;
    registerOnline: string;
    registerBy: string;
    rosterBy: string;
    sectionPrizes: string;
    sectionIndividual: string;
    sectionEntry: string;
    sectionFormat: string;
    sectionAdvancement: string;
    sectionNotices: string;
    sectionContact: string;
    phone: string;
    email: string;
  }
> = {
  'zh-hk': {
    back: '返回',
    downloadForm: '下載報名表格（Word）',
    registerOnline: '網上球隊報名',
    registerBy: '報名截止',
    rosterBy: '球員名單截止',
    sectionPrizes: '獎項',
    sectionIndividual: '個人獎項',
    sectionEntry: '參加辦法及費用',
    sectionFormat: '賽制',
    sectionAdvancement: '晉級安排',
    sectionNotices: '注意事項',
    sectionContact: '查詢',
    phone: '電話',
    email: '電郵',
  },
  'zh-cn': {
    back: '返回',
    downloadForm: '下载报名表（Word）',
    registerOnline: '网上球队报名',
    registerBy: '报名截止',
    rosterBy: '球员名单截止',
    sectionPrizes: '奖项',
    sectionIndividual: '个人奖项',
    sectionEntry: '参加办法及费用',
    sectionFormat: '赛制',
    sectionAdvancement: '晋级安排',
    sectionNotices: '注意事项',
    sectionContact: '查询',
    phone: '电话',
    email: '电邮',
  },
  en: {
    back: 'Back',
    downloadForm: 'Download entry form (Word)',
    registerOnline: 'Register your team online',
    registerBy: 'Registration closes',
    rosterBy: 'Roster deadline',
    sectionPrizes: 'Prizes',
    sectionIndividual: 'Individual awards',
    sectionEntry: 'How to enter & fees',
    sectionFormat: 'Competition format',
    sectionAdvancement: 'Knockout structure',
    sectionNotices: 'Important notices',
    sectionContact: 'Enquiries',
    phone: 'Phone',
    email: 'Email',
  },
};