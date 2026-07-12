import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminLogin from '@/components/AdminLogin';

/** 强制动态渲染（使用 cookies 会话） */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 管理后台登录页 */
export default async function AdminPage() {
  const session = await getSession();

  if (session.isLoggedIn) {
    redirect('/admin/dashboard');
  }

  return <AdminLogin />;
}
