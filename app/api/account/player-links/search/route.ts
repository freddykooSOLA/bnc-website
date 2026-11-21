import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { playerLinksEnabled, searchScorelabPlayersAllLeagues } from '@/lib/player-link-service';

export async function GET(request: Request) {
  if (!playerLinksEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';

  try {
    const players = await searchScorelabPlayersAllLeagues(q);
    return NextResponse.json({ players });
  } catch {
    return NextResponse.json({ error: 'scorelab' }, { status: 503 });
  }
}