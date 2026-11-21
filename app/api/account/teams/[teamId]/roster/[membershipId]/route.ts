import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureRosterEditable, validateRosterCount, validateRosterPlayer } from '@/lib/team-roster';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string; membershipId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  try {
    await ensureRosterEditable(params.teamId, session.user.id);
    const existing = await prisma.teamMembership.findFirst({
      where: { id: params.membershipId, teamId: params.teamId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (existing.memberId) {
      return NextResponse.json({ error: 'claimed' }, { status: 409 });
    }

    const others = await prisma.teamMembership.findMany({
      where: { teamId: params.teamId, NOT: { id: params.membershipId } },
    });
    const jerseys = new Set(others.map((m) => m.jerseyNumber));
    const jerseyNumber = body.jerseyNumber !== undefined ? Number(body.jerseyNumber) : existing.jerseyNumber;

    const parsed = validateRosterPlayer(
      {
        nameZh: body.nameZh !== undefined ? String(body.nameZh) : existing.nameZh,
        nameEn: body.nameEn !== undefined ? String(body.nameEn) : existing.nameEn,
        idPartial: body.idPartial !== undefined ? String(body.idPartial) : existing.idPartial,
        staffId:
          body.staffId !== undefined
            ? String(body.staffId)
            : existing.staffId ?? undefined,
        jerseyNumber,
      },
      jerseys,
      { skipJersey: existing.jerseyNumber }
    );
    if (!parsed.ok) {
      return NextResponse.json({ error: 'validation', fields: parsed.errors }, { status: 400 });
    }

    await prisma.teamMembership.update({
      where: { id: params.membershipId },
      data: {
        nameZh: parsed.value.nameZh,
        nameEn: parsed.value.nameEn,
        idPartial: parsed.value.idPartial,
        staffId: parsed.value.staffId ?? null,
        jerseyNumber: parsed.value.jerseyNumber,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'roster_locked') return NextResponse.json({ error: 'locked' }, { status: 409 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { teamId: string; membershipId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const ctx = await ensureRosterEditable(params.teamId, session.user.id);
    const countAfter = ctx.team.memberships.length - 1;
    if (!validateRosterCount(countAfter)) {
      return NextResponse.json({ error: 'validation', fields: { roster: 'count' } }, { status: 400 });
    }
    const existing = await prisma.teamMembership.findFirst({
      where: { id: params.membershipId, teamId: params.teamId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    await prisma.teamMembership.delete({ where: { id: params.membershipId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'roster_locked') return NextResponse.json({ error: 'locked' }, { status: 409 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}