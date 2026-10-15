import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';
import { buildTeamCalendarIcs } from '@/lib/team-calendar';

interface RouteParams {
  params: { leagueId: string; teamId: string };
}

function findLeague(leagueId: string) {
  const config = getConfig();
  const all = [...config.matches.leagues, ...config.matches.archiveLeagues];
  return all.find((l) => l.id === leagueId);
}

export async function GET(_request: Request, { params }: RouteParams) {
  const teamId = params.teamId.replace(/\.ics$/i, '');
  const league = findLeague(params.leagueId);
  if (!league) {
    return new NextResponse('Not found', { status: 404 });
  }

  let seasonData;
  try {
    seasonData = await getCachedSeasonData(league.url);
  } catch {
    return new NextResponse('Season data unavailable', { status: 503 });
  }

  const team = seasonData.standings.find((s) => s.teamId === teamId);
  if (!team) {
    return new NextResponse('Team not found', { status: 404 });
  }

  const ics = buildTeamCalendarIcs(teamId, team.teamName, seasonData.matches);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${teamId}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  });
}
