import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  assertLeaderOwnsTeam,
  ensureRosterEditable,
  getTeamRosterContext,
  rosterEnabled,
  validateRosterCount,
  validateRosterPlayer,
} from '@/lib/team-roster';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { teamId: string } }
) {
  if (!rosterEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const readCtx = await getTeamRosterContext(params.teamId, session.user.id);
    return NextResponse.json({
      team: {
        id: readCtx.team.id,
        name: readCtx.team.name,
        bank: readCtx.team.bank,
      },
      entry: readCtx.entry
        ? {
            ref: readCtx.entry.ref,
            status: readCtx.entry.status,
            competitionTitle: readCtx.entry.competition.title,
          }
        : null,
      rosterBy: readCtx.rosterBy?.toISOString() ?? null,
      editable: readCtx.editable,
      players: readCtx.team.memberships.map((m) => ({
        id: m.id,
        nameZh: m.nameZh,
        nameEn: m.nameEn,
        idPartial: m.idPartial,
        staffId: m.staffId ?? '',
        jerseyNumber: m.jerseyNumber,
        status: m.status,
        hasInvite: Boolean(m.inviteToken),
        memberJoined: Boolean(m.memberId),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'not_found') return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  if (!rosterEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
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

  const jerseyNumber = Number(body.jerseyNumber);

  try {
    const ctx = await ensureRosterEditable(params.teamId, session.user.id);
    const jerseys = new Set(ctx.team.memberships.map((m) => m.jerseyNumber));
    const parsed = validateRosterPlayer(
      {
        nameZh: String(body.nameZh ?? ''),
        nameEn: String(body.nameEn ?? ''),
        idPartial: String(body.idPartial ?? ''),
        staffId: typeof body.staffId === 'string' ? body.staffId : undefined,
        jerseyNumber,
      },
      jerseys
    );
    if (!parsed.ok) {
      return NextResponse.json({ error: 'validation', fields: parsed.errors }, { status: 400 });
    }
    if (!validateRosterCount(ctx.team.memberships.length + 1)) {
      return NextResponse.json({ error: 'validation', fields: { roster: 'count' } }, { status: 400 });
    }

    const row = await prisma.teamMembership.create({
      data: {
        teamId: params.teamId,
        nameZh: parsed.value.nameZh,
        nameEn: parsed.value.nameEn,
        idPartial: parsed.value.idPartial,
        staffId: parsed.value.staffId ?? null,
        jerseyNumber: parsed.value.jerseyNumber,
        isCaptain: false,
        status: 'listed',
      },
    });
    return NextResponse.json({ id: row.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'roster_locked') return NextResponse.json({ error: 'locked' }, { status: 409 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}