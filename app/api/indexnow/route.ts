import { NextResponse } from 'next/server';
import { LANGUAGES } from '@/lib/i18n';
import { indexNowUrlsForLang, submitIndexNow } from '@/lib/indexnow';

/** POST：提交主要頁面到 IndexNow（需本機／Vercel 已授權觸發） */
export async function POST() {
  const urlList = LANGUAGES.flatMap((lang) => indexNowUrlsForLang(lang));
  const result = await submitIndexNow(urlList);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
