import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listPendingPlayerLinks, playerLinksEnabled } from '@/lib/player-link-service';
import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!playerLinksEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const links = await listPendingPlayerLinks();
  const config = getConfig();
  const allLeagues = [...config.matches.leagues, ...config.matches.archiveLeagues];

  return NextResponse.json({
    links: links.map((l) => ({
      id: l.id,
      status: l.status,
      leagueId: l.leagueId,
      playerId: l.playerId,
      leagueLabel: allLeagues.find((x) => x.id === l.leagueId)?.season ?? l.leagueId,
      memberName: l.member.displayName,
      memberEmail: l.member.email,
    })),
  });
}