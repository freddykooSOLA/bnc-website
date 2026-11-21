import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCompetition } from '@/lib/competitions';
import { competitionEntriesEnabled, submitTeamEntry } from '@/lib/competition-db';
import { validateTeamEntryInput } from '@/lib/competition-entry-validation';
import {
  isCompetitionRegistrationOpen,
  leaderHasCompetitionEntry,
} from '@/lib/competition-registration';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  if (!competitionEntriesEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const competition = getCompetition(params.slug);
  if (!competition) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (!isCompetitionRegistrationOpen(competition)) {
    return NextResponse.json({ error: 'closed' }, { status: 409 });
  }

  const session = await auth();
  const memberId = session?.user?.id;
  if (!memberId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (await leaderHasCompetitionEntry(params.slug, memberId)) {
    return NextResponse.json({ error: 'duplicate' }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = validateTeamEntryInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'validation', fields: parsed.errors }, { status: 400 });
  }

  if (parsed.value.division !== competition.category['zh-hk'] && parsed.value.division !== '男子组' && parsed.value.division !== '男子組') {
    return NextResponse.json({ error: 'validation', fields: { division: 'invalid' } }, { status: 400 });
  }

  try {
    const { ref } = await submitTeamEntry({
      slug: params.slug,
      memberId,
      input: parsed.value,
    });
    const meta = getCompetition(params.slug);
    return NextResponse.json({
      ref,
      paymentNote: meta?.chequePayee['zh-hk'] ?? meta?.chequePayee.en ?? '',
    });
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}