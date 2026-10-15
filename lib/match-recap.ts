import type { Lang, MatchRow } from '@/types';
import { formatMatchDateTimeHK } from '@/lib/scorelab-time';
import { UI_TEXT } from '@/lib/i18n';

export function recapScoreTitle(match: MatchRow): string {
  const home = match.homeScore ?? 0;
  const away = match.awayScore ?? 0;
  return `${match.homeTeam} ${home}–${away} ${match.awayTeam}`;
}

function winnerSide(match: MatchRow): 'home' | 'away' | 'tie' | null {
  if (!match.isMatchEnd || match.homeScore === null || match.awayScore === null) {
    return null;
  }
  if (match.homeScore > match.awayScore) return 'home';
  if (match.awayScore > match.homeScore) return 'away';
  return 'tie';
}

export function recapResultSentence(match: MatchRow, lang: Lang): string {
  const t = UI_TEXT[lang];
  const side = winnerSide(match);
  if (!side || side === 'tie') {
    return t.recapTie.replace('{home}', match.homeTeam).replace('{away}', match.awayTeam);
  }
  const winner = side === 'home' ? match.homeTeam : match.awayTeam;
  const loser = side === 'home' ? match.awayTeam : match.homeTeam;
  const margin = Math.abs((match.homeScore ?? 0) - (match.awayScore ?? 0));
  return t.recapWin
    .replace('{winner}', winner)
    .replace('{loser}', loser)
    .replace('{margin}', String(margin));
}

export function recapMetaLine(match: MatchRow, lang: Lang): string {
  const datePart = formatMatchDateTimeHK(match.date, lang);
  const loc = match.location?.trim();
  if (loc) return `${datePart} · ${loc}`;
  return datePart;
}

export function newsArticlePath(leagueId: string, matchId: string): string {
  return `/news/${leagueId}/${matchId}`;
}
