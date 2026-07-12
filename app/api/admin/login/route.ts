import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 管理员登录 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
