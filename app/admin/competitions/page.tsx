import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminCompetitionsPanel from '@/components/AdminCompetitionsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminCompetitionsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-primary text-white px-6 py-4 flex flex-wrap gap-4 items-center justify-between">
        <span className="font-bold text-lg">比賽報名審批</span>
        <div className="flex gap-4 text-sm">
          <a href="/admin/dashboard" className="text-white/80 hover:text-white min-h-11 inline-flex items-center">
            站點設定
          </a>
          <a href="/admin/checkin" className="text-white/80 hover:text-white min-h-11 inline-flex items-center">
            活動簽到
          </a>
        </div>
      </header>
      <AdminCompetitionsPanel />
    </div>
  );
}