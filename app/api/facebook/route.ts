import { NextResponse } from 'next/server';

/** Facebook 贴文 API — 预留 Graph API 接口，目前由前端 Page Plugin 处理 */
export async function GET() {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID || '100094558236356';

  if (!token) {
    return NextResponse.json({
      posts: [],
      message: 'Facebook Access Token 未配置，请使用 Page Plugin 嵌入',
    });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message,created_time,permalink_url&limit=3&access_token=${token}`,
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) throw new Error('Facebook API 请求失败');

    const data = await res.json();
    const posts = (data.data ?? []).map(
      (post: { message?: string; created_time: string; permalink_url: string }) => ({
        message: post.message ?? '',
        createdAt: post.created_time,
        url: post.permalink_url,
      })
    );

    return NextResponse.json({ posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取失败';
    return NextResponse.json({ posts: [], error: message }, { status: 502 });
  }
}
