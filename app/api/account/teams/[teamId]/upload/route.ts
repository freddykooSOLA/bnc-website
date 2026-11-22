import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureRosterEditable } from '@/lib/team-roster';
import { prisma } from '@/lib/prisma';

type Payload = { kind: 'logo' | 'photo'; membershipId?: string };

function parsePayload(raw: string | null): Payload {
  if (!raw) throw new Error('invalid');
  const data = JSON.parse(raw) as Payload;
  if (data.kind === 'logo') return data;
  if (data.kind === 'photo' && data.membershipId) return data;
  throw new Error('invalid');
}

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'blob_unconfigured' }, { status: 503 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);
        if (!pathname.startsWith(`bnc/teams/${params.teamId}/`)) {
          throw new Error('forbidden_path');
        }
        await ensureRosterEditable(params.teamId, session.user!.id);
        if (payload.kind === 'photo') {
          const membership = await prisma.teamMembership.findFirst({
            where: { id: payload.membershipId, teamId: params.teamId },
          });
          if (!membership) throw new Error('not_found');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parsePayload(tokenPayload ?? null);
        if (payload.kind === 'logo') {
          await prisma.team.update({
            where: { id: params.teamId },
            data: { logoUrl: blob.url },
          });
        } else if (payload.kind === 'photo' && payload.membershipId) {
          await prisma.teamMembership.update({
            where: { id: payload.membershipId },
            data: { photoUrl: blob.url },
          });
        }
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    if (msg === 'roster_locked' || msg === 'forbidden') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'upload_failed' }, { status: 400 });
  }
}