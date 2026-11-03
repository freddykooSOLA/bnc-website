export const INDEXNOW_KEY = 'hq103bncleague';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

export function indexNowKeyLocation(): string {
  return `${BASE_URL}/${INDEXNOW_KEY}.txt`;
}

/** 通知 Bing / IndexNow 參與者（部署後手動或 API 觸發） */
export async function submitIndexNow(urlList: string[]): Promise<{ ok: boolean; status: number }> {
  const host = new URL(BASE_URL).host;
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(),
      urlList: urlList.slice(0, 10000),
    }),
  });
  return { ok: res.ok || res.status === 202, status: res.status };
}

export function indexNowUrlsForLang(lang: string): string[] {
  return [
    `${BASE_URL}/${lang}`,
    `${BASE_URL}/${lang}/matches`,
    `${BASE_URL}/${lang}/about`,
    `${BASE_URL}/${lang}/events`,
  ];
}
