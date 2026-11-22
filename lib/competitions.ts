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
      'zh-hk': "金盃、銀盃各設冠軍、亞軍、季軍、殿軍，獎盃及獎牌。\n銀碟設冠軍、亞軍，獎盃及獎牌。",
      'zh-cn': "金杯、银杯各设冠军、亚军、季军、殿军，奖杯及奖牌。\n银碟设冠军、亚军，奖杯及奖牌。",
      en: "Gold Cup and Silver Cup: 1st–4th, trophies and medals.\nSilver Plate: 1st–2nd, trophies and medals.",
    },
    individualAwards: {
      'zh-hk': "個人獎項設得分王、籃板王、助攻王、封阻王、三分王，各獎盃一個。不設其他個人獎項。獎項以整個賽季的數據計算。",
      'zh-cn': "个人奖项设得分王、篮板王、助攻王、封阻王、三分王，各奖杯一个。不设其他个人奖项。奖项以整个赛季的数据计算。",
      en: "Individual awards: top scorer, rebounds, assists, blocks and three-pointers — one trophy each, based on the whole season. No other individual awards.",
    },
    registerBy: '2026-12-31',
    rosterBy: '2027-01-31',
    fee: {
      'zh-hk': '每間會員銀行 HK$10,000（每隊 6 至 8 場，平均 7 場）',
      'zh-cn': '每间会员银行 HK$10,000（每队 6 至 8 场，平均 7 场）',
      en: 'HK$10,000 per member bank (6–8 games per team, 7 on average)',
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
      'zh-hk': "10 隊抽籤分 A、B 兩組，每組 5 隊單循環，每隊 4 場，共 20 場；勝 3 分、和 1 分、負 0 分。全賽 35 場、18 個比賽日，每星期一個比賽日，每日兩場（第 18 週只打金盃決賽）。每場四節、每節 10 分鐘；第 1 至 20 場平手記和波，不加時；第 21 至 35 場平手以輪流罰五球決勝。",
      'zh-cn': "10 队抽签分 A、B 两组，每组 5 队单循环，每队 4 场，共 20 场；胜 3 分、和 1 分、负 0 分。全赛 35 场、18 个比赛日，每星期一个比赛日，每日两场（第 18 周只打金杯决赛）。每场四节、每节 10 分钟；第 1 至 20 场平手记和波，不加时；第 21 至 35 场平手以轮流罚五球决胜。",
      en: "10 teams drawn into Groups A and B (5 each), single round-robin, 4 games per team, 20 games; win 3, draw 1, loss 0. 35 games over 18 match days, one match day a week, two games a day (week 18: Gold Cup final only). Four 10-minute quarters; games 1–20 may end in a draw (no overtime); games 21–35 tied after 40 minutes go to a five-shot free-throw shootout.",
    },
    tieBreak: {
      'zh-hk': "積分相同時，依次比較：兩隊對賽往績 → 總得分較多 → 總失分較少 → 得失分差 → 抽籤。比較完一項後，如只剩部分隊伍同分，由第一項重新比較。",
      'zh-cn': "积分相同时，依次比较：两队对赛往绩 → 总得分较多 → 总失分较少 → 得失分差 → 抽签。比较完一项后，如只剩部分队伍同分，由第一项重新比较。",
      en: "Tie-break order: head-to-head → more points scored → fewer points allowed → point differential → draw. If only some teams remain tied after a step, restart from the first step for them.",
    },
    advancement: {
      'zh-hk': "分組賽後打四場初賽（21：A4 對 B5；22：A5 對 B4；23：A2 對 B3；24：A3 對 B2），A、B 組首名直接入第 25、27 場。第 21、22 場負方入銀碟（2 隊）；其餘 8 隊按晉級圖分入金盃（4 隊）及銀盃（4 隊），各打準決賽、季殿戰及決賽。第 21 至 35 場必須分勝負。",
      'zh-cn': "分组赛后打四场初赛（21：A4 对 B5；22：A5 对 B4；23：A2 对 B3；24：A3 对 B2），A、B 组首名直接入第 25、27 场。第 21、22 场负方入银碟（2 队）；其余 8 队按晋级图分入金杯（4 队）及银杯（4 队），各打准决赛、季殿战及决赛。第 21 至 35 场必须分胜负。",
      en: "After the groups, four preliminary games (21: A4 v B5; 22: A5 v B4; 23: A2 v B3; 24: A3 v B2); group winners go straight to games 25 and 27. Losers of games 21 and 22 play the Silver Plate (2 teams); the other 8 teams split into the Gold Cup (4) and Silver Cup (4) by the bracket, each with semi-finals, 3rd/4th place and a final. Games 21–35 must produce a winner.",
    },
    notices: [
      {
        'zh-hk': "比賽採用香港籃球總會現行採用的 FIBA 規則；本賽例沒有列明的，以 FIBA 規則為準。",
        'zh-cn': "比赛采用香港篮球总会现行采用的 FIBA 规则；本赛例没有列明的，以 FIBA 规则为准。",
        en: "FIBA rules as used by the Hong Kong Basketball Association apply where these rules are silent.",
      },
      {
        'zh-hk': "參賽球員須為所代表銀行的職員，由領隊在報名表聲明確認；賽季期間離職的員工不能再代表該銀行。每名球員只可代表一隊。",
        'zh-cn': "参赛球员须为所代表银行的职员，由领队在报名表声明确认；赛季期间离职的员工不能再代表该银行。每名球员只可代表一队。",
        en: "Players must be staff of the bank they represent, confirmed by the team manager on the entry form; staff who leave mid-season can no longer play for that bank. Each player may represent one team only.",
      },
      {
        'zh-hk': "每隊最多登記 20 名球員，另加教練及領隊各 1 名。球員退隊可申請添加球員替補；曾退隊的球員同一賽季不能再參賽。",
        'zh-cn': "每队最多登记 20 名球员，另加教练及领队各 1 名。球员退队可申请添加球员替补；曾退队的球员同一赛季不能再参赛。",
        en: "Up to 20 players per team plus one coach and one team manager. A withdrawn player may be replaced; a withdrawn player cannot return in the same season.",
      },
      {
        'zh-hk': "球隊須於開賽前 15 分鐘報到，交出場球員名單，並與球證進行球員出場確認登記。主辦單位可要求出示職員證或身份證明；冒名頂替，該場判負，並取消該球員參賽資格。",
        'zh-cn': "球队须于开赛前 15 分钟报到，交出场球员名单，并与球证进行球员出场确认登记。主办单位可要求出示职员证或身份证明；冒名顶替，该场判负，并取消该球员参赛资格。",
        en: "Teams report 15 minutes before tip-off with the lineup sheet for check-in with the referee. Staff card or ID may be requested; an impostor forfeits the game and is disqualified.",
      },
      {
        'zh-hk': "開賽時間過後 10 分鐘仍未有 5 名球員出場，該隊作棄權，對手以 20:0 勝出；分組賽棄權得 0 分。棄權兩場或以上，主辦單位可取消該隊所有賽果。",
        'zh-cn': "开赛时间过后 10 分钟仍未有 5 名球员出场，该队作弃权，对手以 20:0 胜出；分组赛弃权得 0 分。弃权两场或以上，主办单位可取消该队所有赛果。",
        en: "A team without 5 players 10 minutes after the scheduled start forfeits 20–0 (0 points in the group stage). Two or more forfeits may void all of that team’s results.",
      },
      {
        'zh-hk': "個人犯規累計 5 次須離場；每隊每節由第 5 次團隊犯規起，對方獲罰球。被判取消比賽資格者自動停賽下一場；任何打架或暴力行為，主辦單位可取消有關球員以至整隊的參賽資格。",
        'zh-cn': "个人犯规累计 5 次须离场；每队每节由第 5 次团队犯规起，对方获罚球。被判取消比赛资格者自动停赛下一场；任何打架或暴力行为，主办单位可取消有关球员以至整队的参赛资格。",
        en: "Five personal fouls and the player is out; from the 5th team foul in a quarter the opponent shoots free throws. A disqualified player or official is suspended for the next game; fighting or violence may disqualify the player or the whole team.",
      },
      {
        'zh-hk': "每隊須有統一顏色球衣，前後有清楚號碼 0 至 99。賽程先列的一隊穿淺色，後列的穿深色；顏色相近時由主辦單位決定。比賽用 7 號球，由主辦單位提供。",
        'zh-cn': "每队须有统一颜色球衣，前后有清楚号码 0 至 99。赛程先列的一队穿浅色，后列的穿深色；颜色相近时由主办单位决定。比赛用 7 号球，由主办单位提供。",
        en: "Matching kit with clear numbers 0–99 front and back. The team listed first wears light, the second dark; the organiser decides if colours clash. Size 7 balls supplied by the organiser.",
      },
      {
        'zh-hk': "所有判罰及賽果上訴須即時提出，以球證即場判決為準，不接受賽後上訴。",
        'zh-cn': "所有判罚及赛果上诉须即时提出，以球证即场判决为准，不接受赛后上诉。",
        en: "Any appeal must be raised on the spot; the referee’s decision on court is final. No post-game appeals.",
      },
      {
        'zh-hk': "參賽者須確保身體狀況適合劇烈運動。現場不設急救人員；建議各參加銀行為參賽職員購買相關保險，球隊及球員自行承擔責任。主辦單位不負責個人財物遺失。",
        'zh-cn': "参赛者须确保身体状况适合剧烈运动。现场不设急救人员；建议各参加银行为参赛职员购买相关保险，球队及球员自行承担责任。主办单位不负责个人财物遗失。",
        en: "Players must be fit for strenuous exercise. No first-aid staff on site; banks are advised to insure participating staff, and teams and players take their own responsibility. The organiser is not liable for lost belongings.",
      },
      {
        'zh-hk': "首輪報到前兩小時天文台已發出八號預警，或懸掛八號或以上熱帶氣旋警告信號，比賽取消；三號或以下信號、紅色或黃色暴雨（體育館照常開放）比賽繼續；黑色暴雨在體育館開放前生效而體育館暫停開放，比賽取消。主辦單位會盡量於比賽前 2 小時通知，不就取消或改期作出賠償。",
        'zh-cn': "首轮报到前两小时天文台已发出八号预警，或悬挂八号或以上热带气旋警告信号，比赛取消；三号或以下信号、红色或黄色暴雨（体育馆照常开放）比赛继续；黑色暴雨在体育馆开放前生效而体育馆暂停开放，比赛取消。主办单位会尽量于比赛前 2 小时通知，不就取消或改期作出赔偿。",
        en: "Games are cancelled if the T8 pre-warning is issued two hours before first check-in or T8 or above is hoisted; T3 or below, and Red/Amber rain with the venue open, games go ahead; Black Rain before opening with the venue closed, games are cancelled. The organiser aims to notify teams 2 hours before; no compensation for cancellation or rescheduling.",
      },
      {
        'zh-hk': "報名收集的個人資料只用於本賽事的行政、核實資格及聯絡。",
        'zh-cn': "报名收集的个人资料只用于本赛事的行政、核实资格及联络。",
        en: "Personal data collected at registration is used only for running this event, eligibility checks and contact.",
      },
      {
        'zh-hk': "主辦單位對本賽例有最終解釋權及修改權。",
        'zh-cn': "主办单位对本赛例有最终解释权及修改权。",
        en: "The organiser has the final say on interpreting and amending these rules.",
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