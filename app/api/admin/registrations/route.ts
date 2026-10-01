import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { searchRegistrations } from '@/lib/ledger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const query = new URL(request.url).searchParams.get('q') || '';
  try {
    const registrations = await searchRegistrations(query);
    return NextResponse.json({ registrations });
  } catch {
    return NextResponse.json({ error: 'store_unavailable' }, { status: 503 });
  }
}
