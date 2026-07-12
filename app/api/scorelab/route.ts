import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { fetchSeasonData } from '@/lib/scorelab';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** ScoreLab 数据 API — 每次请求实时抓取 */
export async function GET(request: NextRequest) {
  const seasonId = request.nextUrl.searchParams.get('seasonId');
  const url = request.nextUrl.searchParams.get('url');

  let seasonUrl = url;

  if (!seasonUrl && seasonId) {
    const config = getConfig();
    const allLeagues = [
      ...config.matches.leagues,
      ...config.matches.archiveLeagues,
    ];
    const league = allLeagues.find((l) => l.id === seasonId);
    if (!league) {
      return NextResponse.json({ error: '联赛未找到' }, { status: 404 });
    }
    seasonUrl = league.url;
  }

  if (!seasonUrl) {
    return NextResponse.json(
      { error: '缺少 seasonId 或 url 参数' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchSeasonData(seasonUrl);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '数据获取失败';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
