import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureRosterEditable, generateInviteToken, rosterEnabled } from '@/lib/team-roster';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { teamId: string; membershipId: string } }
) {
  if (!rosterEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let lang = 'zh-hk';
  try {
    const body = (await request.json()) as { lang?: string };
    if (body.lang === 'zh-cn' || body.lang === 'en' || body.lang === 'zh-hk') lang = body.lang;
  } catch {
    /* default lang */
  }

  try {
    await ensureRosterEditable(params.teamId, session.user.id);
    const membership = await prisma.teamMembership.findFirst({
      where: { id: params.membershipId, teamId: params.teamId },
    });
    if (!membership) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (membership.memberId) {
      return NextResponse.json({ error: 'already_joined' }, { status: 409 });
    }

    const token = generateInviteToken();
    if (token.length < 32) {
      return NextResponse.json({ error: 'server' }, { status: 500 });
    }

    await prisma.teamMembership.update({
      where: { id: params.membershipId },
      data: { inviteToken: token },
    });

    const origin = new URL(request.url).origin;
  const path = `/${lang}/join/${encodeURIComponent(token)}`;
    return NextResponse.json({ token, url: `${origin}${path}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'roster_locked') return NextResponse.json({ error: 'locked' }, { status: 409 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}