import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureRosterEditable } from '@/lib/team-roster';
import { validateTeamBlobMediaUrl, type TeamBlobMediaKind } from '@/lib/team-blob-media-url';
import { prisma } from '@/lib/prisma';

type Body = { kind: TeamBlobMediaKind; membershipId?: string; url: string };

function parseBody(raw: unknown): Body {
  if (!raw || typeof raw !== 'object') throw new Error('invalid');
  const o = raw as Record<string, unknown>;
  if (o.kind !== 'logo' && o.kind !== 'photo') throw new Error('invalid');
  if (typeof o.url !== 'string' || !o.url.trim()) throw new Error('invalid');
  if (o.kind === 'photo' && typeof o.membershipId !== 'string') throw new Error('invalid');
  return {
    kind: o.kind,
    url: o.url.trim(),
    membershipId: typeof o.membershipId === 'string' ? o.membershipId : undefined,
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = parseBody(await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  try {
    await ensureRosterEditable(params.teamId, session.user.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'roster_locked') return NextResponse.json({ error: 'locked' }, { status: 409 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  const check = validateTeamBlobMediaUrl(body.url, body.kind, params.teamId, body.membershipId);
  if (!check.ok) {
    return NextResponse.json({ error: check.reason }, { status: 400 });
  }

  if (body.kind === 'logo') {
    await prisma.team.update({
      where: { id: params.teamId },
      data: { logoUrl: body.url },
    });
    return NextResponse.json({ ok: true, logoUrl: body.url });
  }

  const membership = await prisma.teamMembership.findFirst({
    where: { id: body.membershipId, teamId: params.teamId },
  });
  if (!membership) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  await prisma.teamMembership.update({
    where: { id: membership.id },
    data: { photoUrl: body.url },
  });
  return NextResponse.json({ ok: true, photoUrl: body.url });
}