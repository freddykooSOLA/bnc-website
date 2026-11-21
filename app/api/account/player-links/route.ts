import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createPlayerLink,
  listMemberPlayerLinks,
  playerLinksEnabled,
} from '@/lib/player-link-service';

export async function GET() {
  if (!playerLinksEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const links = await listMemberPlayerLinks(session.user.id);
  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  if (!playerLinksEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { leagueId?: string; playerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  if (!body.leagueId || !body.playerId) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }

  try {
    const link = await createPlayerLink(session.user.id, body.leagueId, body.playerId);
    return NextResponse.json({ id: link.id, status: link.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'player_not_found' || msg === 'league_not_found') {
      return NextResponse.json({ error: msg }, { status: 404 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}