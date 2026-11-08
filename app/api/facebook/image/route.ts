import { NextRequest, NextResponse } from 'next/server';
import { getFacebookImage } from '@/lib/facebook';

/** 只代理最近 3 帖裡的圖，不接受任意網址。 */
export async function GET(request: NextRequest) {
  const index = Number(request.nextUrl.searchParams.get('n'));
  const image = await getFacebookImage(index);
  if (!image) return new NextResponse(null, { status: 404 });
  return image;
}
