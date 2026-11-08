import type { Lang, MatchRow } from '@/types';
import { formatMatchDateTimeHK } from '@/lib/scorelab-time';
import { UI_TEXT } from '@/lib/i18n';
import type { BoxLeader, LeaderKey, MatchBox, PeriodScore } from '@/lib/scorelab-box';

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

const LEADER_LABEL: Record<LeaderKey, string> = {
  PTS: 'recapPts',
  AST: 'recapAst',
  REB: 'recapReb',
  '3PM': 'recapThrees',
};

export function leaderLabel(key: LeaderKey, lang: Lang): string {
  return UI_TEXT[lang][LEADER_LABEL[key]];
}

export function periodLabel(kind: 'quarter' | 'overtime', index: number, lang: Lang): string {
  const t = UI_TEXT[lang];
  const n = String(index + 1);
  if (kind === 'quarter') return t.recapQuarter.replace('{n}', n);
  if (index === 0) return t.recapOvertime;
  return t.recapOvertimeN.replace('{n}', n);
}

function scorePair(row: PeriodScore): string {
  return `${row.home}–${row.away}`;
}

function playerName(player: BoxLeader['players'][number], lang: Lang): string {
  const who = player.jersey ? `#${player.jersey} ${player.name}` : player.name;
  if (!player.teamName) return who;
  return lang === 'en' ? `${who} (${player.teamName})` : `${who}（${player.teamName}）`;
}

/** 用比分和數據寫成一段，不另加沒有數字支持的描述。 */
export function recapStatsParagraph(box: MatchBox, lang: Lang): string {
  const t = UI_TEXT[lang];
  const joiner = lang === 'en' ? ', ' : '、';
  const gap = lang === 'en' ? ' ' : '';
  const parts: string[] = [];
  if (box.quarters.length > 0) {
    parts.push(t.recapQuarterRun.replace('{scores}', box.quarters.map(scorePair).join(joiner)));
  }
  if (box.overtime.length > 0) {
    parts.push(t.recapOvertimeRun.replace('{scores}', box.overtime.map(scorePair).join(joiner)));
  }
  for (const leader of box.leaders) {
    const names = leader.players
      .map((player) => playerName(player, lang))
      .join(lang === 'en' ? ' and ' : '、');
    parts.push(
      t.recapLeaderBit
        .replace('{label}', leaderLabel(leader.key, lang))
        .replace('{names}', names)
        .replace('{value}', String(leader.value))
    );
  }
  return parts.join(gap);
}
