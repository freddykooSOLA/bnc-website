import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  adminCompetitionsEnabled,
  listCompetitionEntries,
} from '@/lib/admin-competitions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!adminCompetitionsEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const competitions = await listCompetitionEntries();
  return NextResponse.json({
    competitions: competitions.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      entries: c.entries.map((e) => ({
        id: e.id,
        ref: e.ref,
        status: e.status,
        rosterUnlocked: e.rosterUnlocked,
        createdAt: e.createdAt.toISOString(),
        statusUpdatedAt: e.statusUpdatedAt?.toISOString() ?? null,
        leaderNameZh: e.leaderNameZh,
        leaderNameEn: e.leaderNameEn,
        teamName: e.team.name,
        bank: e.team.bank,
        rosterCount: e.team.memberships.length,
        roster: e.team.memberships.map((m) => ({
          nameZh: m.nameZh,
          nameEn: m.nameEn,
          idPartial: m.idPartial,
          jerseyNumber: m.jerseyNumber,
          status: m.status,
        })),
      })),
    })),
  });
}