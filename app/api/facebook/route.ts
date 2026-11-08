import { NextResponse } from 'next/server';
import { getFacebookPosts } from '@/lib/facebook';

/** 最近 3 則專頁帖。沒有權杖時回空陣列，頁面改嵌時間線。 */
export async function GET() {
  try {
    const posts = await getFacebookPosts();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [], error: '获取失败' }, { status: 502 });
  }
}
