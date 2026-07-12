import type { Lang, LocalizedString } from '@/types';

/** 繁体转简体字符映射（去重） */
const ZH_TW_TO_CN_ENTRIES: [string, string][] = [
  ['聯', '联'], ['賽', '赛'], ['籃', '篮'], ['隊', '队'], ['員', '员'],
  ['積', '积'], ['關', '关'], ['於', '于'], ['們', '们'], ['這', '这'],
  ['個', '个'], ['為', '为'], ['與', '与'], ['舉', '举'], ['辦', '办'],
  ['專', '专'], ['業', '业'], ['區', '区'], ['灣', '湾'], ['競', '竞'],
  ['會', '会'], ['學', '学'], ['屇', '届'], ['華', '华'], ['僑', '侨'],
  ['銀', '银'], ['請', '请'], ['鬥', '斗'], ['載', '载'], ['敗', '败'],
  ['暫', '暂'], ['無', '无'], ['數', '数'], ['據', '据'], ['時', '时'],
  ['機', '机'], ['構', '构'], ['運', '运'], ['動', '动'], ['體', '体'],
  ['戰', '战'], ['榮', '荣'], ['協', '协'], ['獅', '狮'], ['匯', '汇'],
  ['頂', '顶'], ['過', '过'], ['樂', '乐'], ['從', '从'], ['憑', '凭'],
  ['豐', '丰'], ['驗', '验'], ['現', '现'], ['並', '并'], ['團', '团'],
  ['類', '型'], ['歡', '欢'], ['隨', '随'], ['絡', '络'], ['電', '电'],
  ['話', '话'], ['郵', '邮'], ['龍', '龙'], ['觀', '观'], ['樓', '楼'],
  ['勝', '胜'], ['負', '负'], ['淨', '净'], ['對', '对'], ['陣', '阵'],
  ['狀', '态'], ['點', '点'], ['結', '结'], ['開', '开'], ['進', '进'],
  ['權', '权'], ['將', '将'], ['熱', '热'], ['決', '决'], ['國', '国'],
  ['際', '际'], ['際', '际'], ['際', '际'],
];

const ZH_TW_TO_CN: Record<string, string> = Object.fromEntries(ZH_TW_TO_CN_ENTRIES);

/** 常用短语英文翻译 */
const PHRASE_EN: [string, string][] = [
  ['BNC 籃球聯賽', 'BNC Basketball League'],
  ['首頁', 'Home'], ['關於我們', 'About Us'], ['比賽', 'Matches'],
  ['查看賽程', 'View Schedule'], ['最新排名', 'Latest Standings'],
  ['最新比賽結果', 'Latest Results'], ['即將舉行的賽程', 'Upcoming Schedule'],
  ['最新賽事', 'Current Season'], ['往期賽事', 'Past Seasons'],
  ['積分榜', 'Standings'], ['賽程與結果', 'Schedule & Results'],
  ['聯絡方式', 'Contact'], ['地址', 'Address'], ['電話', 'Phone'], ['郵箱', 'Email'],
  ['版權所有', 'All rights reserved'], ['數據由 ScoreLab 提供', 'Data provided by ScoreLab'],
  ['香港本地籃球聯賽', "Hong Kong's Premier Local Basketball League"],
  ['激情對決，精彩呈現', 'Passionate Competition, Spectacular Action'],
  ['載入中', 'Loading'], ['數據載入失敗', 'Failed to load data'],
  ['暫無數據', 'No data available'], ['最新影片', 'Latest Videos'],
  ['最新貼文', 'Latest Posts'], ['選擇聯賽', 'Select League'],
];

/** 繁体转简体 */
export function toSimplified(text: string): string {
  return text.split('').map((char) => ZH_TW_TO_CN[char] || char).join('');
}

/** 繁体转英文 */
export function toEnglish(text: string): string {
  let result = text;
  const sorted = [...PHRASE_EN].sort((a, b) => b[0].length - a[0].length);
  for (const [zh, en] of sorted) {
    result = result.split(zh).join(en);
  }
  if (/[\u4e00-\u9fff]/.test(result) && result === text) {
    return toSimplified(text);
  }
  return result;
}

/** 从繁体中文生成三语本地化字符串 */
export function expandLocalized(zhHk: string): LocalizedString {
  return {
    'zh-hk': zhHk,
    'zh-cn': toSimplified(zhHk),
    en: toEnglish(zhHk),
  };
}

/** 根据 Accept-Language 检测语言 */
export function detectLangFromHeader(acceptLanguage: string | null): Lang {
  if (!acceptLanguage) return 'zh-hk';

  const langs = acceptLanguage
    .split(',')
    .map((l) => l.split(';')[0].trim().toLowerCase());

  for (const l of langs) {
    if (l.startsWith('zh-hk') || l === 'zh-tw' || l === 'zh-hant') return 'zh-hk';
    if (l.startsWith('zh-cn') || l === 'zh-sg') return 'zh-cn';
    if (l === 'zh') return 'zh-cn';
    if (l.startsWith('en')) return 'en';
  }

  return 'zh-hk';
}
