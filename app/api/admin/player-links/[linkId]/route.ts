import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { playerLinksEnabled, setPlayerLinkStatus } from '@/lib/player-link-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { linkId: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!playerLinksEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  if (body.status !== 'approved' && body.status !== 'rejected') {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  try {
    const updated = await setPlayerLinkStatus(params.linkId, body.status);
    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'player_taken') {
      return NextResponse.json({ error: 'player_taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}