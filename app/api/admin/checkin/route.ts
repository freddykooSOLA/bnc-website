import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { checkIn } from '@/lib/ledger';
import { isRef } from '@/lib/codes';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { ref?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const ref = String(body.ref || '').trim().toUpperCase();
  if (!isRef(ref, 'BNC-E')) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  try {
    const registration = await checkIn(ref);
    if (!registration) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ registration });
  } catch {
    return NextResponse.json({ error: 'store_unavailable' }, { status: 503 });
  }
}
