import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import CheckinDesk from '@/components/CheckinDesk';

export const dynamic = 'force-dynamic';

export default async function AdminCheckinPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect('/admin');
  return <CheckinDesk initialCode={(searchParams.code || '').toUpperCase()} />;
}
