import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { databaseEnabled, prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function serviceUnavailable() {
  return NextResponse.json({ error: 'follows_unavailable' }, { status: 503 });
}

function isMissingTableError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === 'P2021' || code === 'P2022';
}

async function withFollowsDb<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  if (!databaseEnabled()) return serviceUnavailable();
  try {
    return await fn();
  } catch (error) {
    if (isMissingTableError(error)) return serviceUnavailable();
    throw error;
  }
}

export async function GET() {
  const result = await withFollowsDb(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ follows: [] });
    }
    const follows = await prisma.teamFollow.findMany({
      where: { memberId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        leagueId: true,
        teamId: true,
        teamName: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ follows });
  });
  if (result instanceof NextResponse) return result;
  return result;
}

export async function POST(request: Request) {
  const result = await withFollowsDb(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    let body: { leagueId?: string; teamId?: string; teamName?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }
    const leagueId = String(body.leagueId || '').trim();
    const teamId = String(body.teamId || '').trim();
    const teamName = String(body.teamName || '').trim().slice(0, 200);
    if (!leagueId || !teamId || !teamName) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
    }
    await prisma.teamFollow.upsert({
      where: {
        memberId_leagueId_teamId: {
          memberId: session.user.id,
          leagueId,
          teamId,
        },
      },
      create: {
        memberId: session.user.id,
        leagueId,
        teamId,
        teamName,
      },
      update: { teamName },
    });
    return NextResponse.json({ ok: true });
  });
  if (result instanceof NextResponse) return result;
  return result;
}

export async function DELETE(request: Request) {
  const result = await withFollowsDb(async () => {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const url = new URL(request.url);
    const leagueId = url.searchParams.get('leagueId')?.trim() || '';
    const teamId = url.searchParams.get('teamId')?.trim() || '';
    if (!leagueId || !teamId) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
    }
    await prisma.teamFollow.deleteMany({
      where: {
        memberId: session.user.id,
        leagueId,
        teamId,
      },
    });
    return NextResponse.json({ ok: true });
  });
  if (result instanceof NextResponse) return result;
  return result;
}
