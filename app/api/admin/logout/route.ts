import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 管理员登出 */
export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
