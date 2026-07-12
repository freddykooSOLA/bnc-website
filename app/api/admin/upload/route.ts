import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';
import { getConfig, saveConfig } from '@/lib/config';

/** 文件上传（Logo / Favicon / Hero 背景） */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ error: '缺少文件或类型' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const extMap: Record<string, string> = {
      logo: 'png',
      favicon: 'png',
      'hero-bg': 'png',
    };
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const ext = fileExt && ['png', 'jpg', 'jpeg', 'webp', 'ico'].includes(fileExt)
      ? fileExt === 'jpeg' ? 'jpg' : fileExt
      : extMap[type] || 'png';
    const filename = `${type}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const publicPath = `/uploads/${filename}`;
    const config = getConfig();

    if (type === 'logo') config.logo = publicPath;
    else if (type === 'favicon') config.favicon = publicPath;
    else if (type === 'hero-bg') config.hero.backgroundImage = publicPath;

    saveConfig(config);

    return NextResponse.json({ success: true, path: publicPath });
  } catch {
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
