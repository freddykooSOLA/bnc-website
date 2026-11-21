import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { claimInviteToken, joinEnabled } from '@/lib/team-join';

export async function POST(
  _request: Request,
  { params }: { params: { token: string } }
) {
  if (!joinEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const token = decodeURIComponent(params.token);
  const result = await claimInviteToken(token, session.user.id);
  if (!result.ok) {
    const status = result.reason === 'taken' ? 409 : 404;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({
    teamName: result.teamName,
    playerName: result.playerName,
  });
}