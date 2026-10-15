import type { MatchRow } from '@/types';
import { compareMatchDateAsc, scorelabDateToIcsLocal } from '@/lib/scorelab-time';

const CRLF = '\r\n';

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** 單隊未開賽場次 iCalendar（含提前 2 小時 VALARM） */
export function buildTeamCalendarIcs(
  teamId: string,
  teamName: string,
  matches: MatchRow[]
): string {
  const upcoming = matches
    .filter(
      (m) =>
        !m.isMatchEnd &&
        (m.homeTeamId === teamId || m.awayTeamId === teamId) &&
        m.date
    )
    .sort((a, b) => compareMatchDateAsc(a.date, b.date));

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BNC League//Team Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(teamName)} — BNC League`,
  ];

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`;

  for (const m of upcoming) {
    const isHome = m.homeTeamId === teamId;
    const opponent = isHome ? m.awayTeam : m.homeTeam;
    const summary = `${m.homeTeam} vs ${m.awayTeam}`;
    const description = `BNC League — ${teamName} vs ${opponent}`;
    const loc = m.location?.trim() || '';
    const dtStart = scorelabDateToIcsLocal(m.date);
    if (!dtStart) continue;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${m.id}@bncleague.com`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;TZID=Asia/Hong_Kong:${dtStart}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    if (loc) lines.push(`LOCATION:${escapeIcsText(loc)}`);
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT2H');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${escapeIcsText(summary)}`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join(CRLF) + CRLF;
}
