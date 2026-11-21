import { NextResponse } from 'next/server';
import { databaseEnabled } from '@/lib/prisma';
import { recordScorelabSyncRun, runScorelabSync } from '@/lib/scorelab-sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'cron_unconfigured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!databaseEnabled()) {
    return NextResponse.json({ error: 'database_unavailable' }, { status: 503 });
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