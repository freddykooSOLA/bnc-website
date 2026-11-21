import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { databaseEnabled, prisma } from '@/lib/prisma';
import { recordScorelabSyncRun, runScorelabSync } from '@/lib/scorelab-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!databaseEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const runs = await prisma.scoreLabSyncRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      startedAt: r.startedAt.toISOString(),
      finishedAt: r.finishedAt?.toISOString() ?? null,
      ok: r.ok,
      teams: r.teams,
      players: r.players,
      errorsJson: r.errorsJson,
    })),
  });
}

export async function POST() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!databaseEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const startedAt = new Date();
  try {
    const result = await runScorelabSync();
    const finishedAt = new Date();
    await recordScorelabSyncRun(result, startedAt, finishedAt);
    return NextResponse.json({
      ok: result.ok,
      teams: result.teams,
      players: result.players,
      playerSeasons: result.playerSeasons,
      errors: result.errors,
      finishedAt: finishedAt.toISOString(),
    });
  } catch (e) {
    const finishedAt = new Date();
    const message = e instanceof Error ? e.message : 'sync_failed';
    await recordScorelabSyncRun(
      {
        ok: false,
        teams: 0,
        players: 0,
        playerSeasons: 0,
        perLeague: {},
        errors: [{ message }],
      },
      startedAt,
      finishedAt
    );
    return NextResponse.json({ error: 'sync_failed', message }, { status: 500 });
  }
}