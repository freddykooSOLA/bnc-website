import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidLang } from '@/lib/i18n';
import { detectLangFromHeader } from '@/lib/translate';

/** 不需要语言前缀的路径 */
const PUBLIC_PATHS = ['/admin', '/api', '/_next', '/uploads', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 根路径：根据浏览器语言自动跳转
  if (pathname === '/') {
    const acceptLang = request.headers.get('accept-language');
    const lang = detectLangFromHeader(acceptLang);
    return NextResponse.redirect(new URL(`/${lang}`, request.url));
  }

  const segments = pathname.split('/').filter(Boolean);
  const lang = segments[0];

  if (!isValidLang(lang)) {
    const acceptLang = request.headers.get('accept-language');
    const detected = detectLangFromHeader(acceptLang);
    return NextResponse.redirect(
      new URL(`/${detected}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
