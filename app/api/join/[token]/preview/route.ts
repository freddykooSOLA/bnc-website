import { NextResponse } from 'next/server';
import { joinEnabled } from '@/lib/team-join';
import { findMembershipByToken } from '@/lib/team-roster';

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  if (!joinEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const token = decodeURIComponent(params.token);
  const membership = await findMembershipByToken(token);
  if (!membership) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const claimable = Boolean(membership.inviteToken) && !membership.memberId;
  return NextResponse.json({
    teamName: membership.team.name,
    playerName: membership.nameZh || membership.nameEn,
    claimable,
    reason: membership.memberId ? 'taken' : !membership.inviteToken ? 'invalid' : undefined,
  });
}