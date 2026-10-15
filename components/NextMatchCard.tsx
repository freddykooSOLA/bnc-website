'use client';

import { useEffect, useState } from 'react';
import type { Lang, MatchRow } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { formatMatchDateTimeHK } from '@/lib/scorelab-helpers';
import { toRealEpoch } from '@/lib/scorelab-time';
import TeamLogo from './TeamLogo';

function getCountdown(targetEpochMs: number): { days: number; hours: number; minutes: number } | null {
  const diff = targetEpochMs - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

interface NextMatchCardProps {
  lang: Lang;
  match: MatchRow | null;
}

/** 下一場未開賽比賽 */
export default function NextMatchCard({ lang, match }: NextMatchCardProps) {
  const t = UI_TEXT[lang];
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!match?.date) return;

    const tick = () => {
      const parts = getCountdown(toRealEpoch(match.date));
      if (!parts) {
        setCountdown('');
        return;
      }
      setCountdown(
        t.countdownFormat
          .replace('{d}', String(parts.days))
          .replace('{h}', String(parts.hours))
          .replace('{m}', String(parts.minutes))
      );
    };

    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [match?.date, t.countdownFormat]);

  if (!match) return null;

  return (
    <div className="card bg-gradient-to-br from-primary to-primary/90 text-white">
      <h2 className="font-heading text-lg font-bold mb-4">{t.nextMatch}</h2>
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
          <TeamLogo
            name={match.homeTeam}
            imageUrl={match.homeTeamImage}
            abbreviation={match.homeTeamAbbreviation}
            size={48}
            className="ring-2 ring-white/20"
          />
          <span className="text-sm font-medium text-center truncate w-full">
            {match.homeTeam}
          </span>
        </div>
        <span className="text-orange font-bold text-lg shrink-0">VS</span>
        <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
          <TeamLogo
            name={match.awayTeam}
            imageUrl={match.awayTeamImage}
            abbreviation={match.awayTeamAbbreviation}
            size={48}
            className="ring-2 ring-white/20"
          />
          <span className="text-sm font-medium text-center truncate w-full">
            {match.awayTeam}
          </span>
        </div>
      </div>
      <p className="text-center text-white/90 text-sm">
        {formatMatchDateTimeHK(match.date, lang)}
      </p>
      {match.location && (
        <p className="text-center text-white/70 text-xs mt-1">{match.location}</p>
      )}
      {countdown && (
        <p className="text-center text-orange font-semibold mt-3 text-sm">{countdown}</p>
      )}
    </div>
  );
}
