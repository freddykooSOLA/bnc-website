import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCompetition } from '@/lib/competitions';
import {
  competitionEntriesEnabled,
  getDraftPayloadForMember,
  saveTeamEntryDraft,
} from '@/lib/competition-db';
import { validateTeamEntryDraft } from '@/lib/competition-entry-validation';
import { isCompetitionRegistrationOpen } from '@/lib/competition-registration';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  if (!competitionEntriesEnabled()) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const draft = await getDraftPayloadForMember(params.slug, session.user.id);
  if (!draft) {
    return NextResponse.json({ draft: null });
  }
  return NextResponse.json({ draft });
}

export async function PUT(
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = validateTeamEntryDraft(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'validation', fields: parsed.errors }, { status: 400 });
  }

  try {
    const { ref } = await saveTeamEntryDraft({
      slug: params.slug,
      memberId: session.user.id,
      input: parsed.value,
    });
    return NextResponse.json({ ref });
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}