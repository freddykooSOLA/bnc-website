import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getConfig } from '@/lib/config';
import AdminDashboard from '@/components/AdminDashboard';

/** 强制动态渲染（使用 cookies 会话 + 读取配置） */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** 管理后台面板 */
export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/admin');
  }

  const config = getConfig();

  return <AdminDashboard initialConfig={config} />;
}
