import { NextResponse } from 'next/server';
import { fetchLatestVideos } from '@/lib/youtube';

/** YouTube 最新影片 API */
export async function GET() {
  try {
    const videos = await fetchLatestVideos(6);
    return NextResponse.json({ videos });
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取失败';
    return NextResponse.json({ videos: [], error: message }, { status: 502 });
  }
}
