import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

/** 会话数据结构 */
export interface SessionData {
  isLoggedIn: boolean;
}

const DEV_FALLBACK_SECRET =
  'complex_password_at_least_32_characters_long_for_dev';

/** 获取 Session 加密密钥（iron-session 要求至少 32 字符） */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_FALLBACK_SECRET;
  }

  throw new Error(
    'SESSION_SECRET 未设置或不足 32 个字符。请在 Vercel 环境变量中设置至少 32 字符的随机字符串。'
  );
}

/** iron-session 配置 */
export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionSecret(),
    cookieName: 'bnc_admin_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 小时
    },
  };
}

/** 获取当前会话 */
export async function getSession() {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

/** 验证管理员密码 */
export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}
