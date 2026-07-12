import { NextRequest, NextResponse } from 'next/server';
import { buildConfigFromZhHk } from '@/lib/config-helpers';
import { getConfig, saveConfig } from '@/lib/config';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 获取站点配置 */
export async function GET() {
  try {
    return NextResponse.json(getConfig());
  } catch {
    return NextResponse.json({ error: '读取配置失败' }, { status: 500 });
  }
}

/** 更新站点配置（繁体输入自动转三语） */
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const config = buildConfigFromZhHk(body);
    saveConfig(config);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 });
  }
}
