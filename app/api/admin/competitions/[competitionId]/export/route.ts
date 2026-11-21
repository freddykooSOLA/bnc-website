import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  adminCompetitionsEnabled,
  entriesToCsv,
  listCompetitionEntries,
} from '@/lib/admin-competitions';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { competitionId: string } }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!adminCompetitionsEnabled()) {
    return new NextResponse('unavailable', { status: 503 });
  }

  const competitions = await listCompetitionEntries();
  const competition = competitions.find((c) => c.id === params.competitionId);
  if (!competition) {
    return new NextResponse('not_found', { status: 404 });
  }

  const csv = entriesToCsv(competition.title, competition.entries);
  const filename = `bnc-entries-${competition.slug}.csv`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}