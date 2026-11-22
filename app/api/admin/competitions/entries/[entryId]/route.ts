import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  adminCompetitionsEnabled,
  setEntryRosterUnlocked,
  updateEntryStatus,
  type EntryStatus,
} from '@/lib/admin-competitions';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { entryId: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!adminCompetitionsEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  let body: { status?: string; rosterUnlocked?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  try {
    if (typeof body.rosterUnlocked === 'boolean') {
      const updated = await setEntryRosterUnlocked(params.entryId, body.rosterUnlocked);
      return NextResponse.json({
        id: updated.id,
        rosterUnlocked: updated.rosterUnlocked,
        statusUpdatedAt: updated.statusUpdatedAt?.toISOString() ?? null,
      });
    }
    const status = body.status as EntryStatus;
    const updated = await updateEntryStatus(params.entryId, status);
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      statusUpdatedAt: updated.statusUpdatedAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
}