import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminCompetitionsEnabled, listDraftEntries } from '@/lib/admin-competitions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!adminCompetitionsEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const drafts = await listDraftEntries();
  return NextResponse.json({
    drafts: drafts.map((d) => ({
      id: d.id,
      ref: d.ref,
      createdAt: d.createdAt.toISOString(),
      competitionTitle: d.competition.title,
      competitionSlug: d.competition.slug,
      bank: d.team.bank,
      teamName: d.team.name,
      leaderEmail: d.leaderEmail,
      member: d.team.createdBy,
    })),
  });
}