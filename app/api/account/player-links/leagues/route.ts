import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listLeaguesForLinking, playerLinksEnabled } from '@/lib/player-link-service';

export async function GET() {
  if (!playerLinksEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ leagues: listLeaguesForLinking() });
}