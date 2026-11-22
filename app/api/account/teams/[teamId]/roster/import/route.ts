import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureRosterEditable, rosterEnabled } from '@/lib/team-roster';
import { previewRosterUpload } from '@/lib/roster-import-file';
import { prisma } from '@/lib/prisma';

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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'invalid_form' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }

  const mode = form.get('mode') === 'confirm' ? 'confirm' : 'preview';
  const replace = form.get('replace') === 'true';

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const ctx = await ensureRosterEditable(params.teamId, session.user.id);
    const existingJerseys = replace ? [] : ctx.team.memberships.map((m) => m.jerseyNumber);
    const preview = await previewRosterUpload(buffer, file.name, existingJerseys);

    if (mode === 'preview') {
      return NextResponse.json({
        replace,
        preview: preview.rows.map((r) => ({
          rowNumber: r.rowNumber,
          nameZh: r.nameZh,
          nameEn: r.nameEn,
          idPartial: r.idPartial,
          staffId: r.staffId ?? '',
          jerseyNumber: r.jerseyNumber,
          isCaptain: r.isCaptain,
          errors: r.errors,
        })),
        hasErrors: preview.hasErrors,
        validCount: preview.valid.length,
      });
    }

    if (preview.hasErrors || preview.valid.length === 0) {
      return NextResponse.json({ error: 'validation' }, { status: 400 });
    }

    const total = replace ? preview.valid.length : ctx.team.memberships.length + preview.valid.length;
    if (total > 20 || total < 1) {
      return NextResponse.json({ error: 'count' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (replace) {
        await tx.teamMembership.deleteMany({ where: { teamId: params.teamId } });
      }
      await tx.teamMembership.createMany({
        data: preview.valid.map((r) => ({
          teamId: params.teamId,
          nameZh: r.nameZh,
          nameEn: r.nameEn,
          idPartial: r.idPartial,
          staffId: r.staffId ?? null,
          jerseyNumber: r.jerseyNumber,
          isCaptain: r.isCaptain,
          status: 'listed',
        })),
      });
    });

    return NextResponse.json({ imported: preview.valid.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'forbidden') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (msg === 'roster_locked') return NextResponse.json({ error: 'locked' }, { status: 409 });
    if (msg === 'file_too_large') return NextResponse.json({ error: 'too_large' }, { status: 413 });
    if (msg === 'unsupported_type') return NextResponse.json({ error: 'type' }, { status: 400 });
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}