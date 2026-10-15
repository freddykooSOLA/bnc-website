'use client';

import type { Lang, MatchRow, SeasonStage } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import {
  formatMatchDateTimeHK,
  groupMatchesByStage,
} from '@/lib/scorelab-helpers';
import TeamLogo from './TeamLogo';
import YoutubeReplayButton from './YoutubeReplayButton';

interface MatchesTableProps {
  lang: Lang;
  matches: MatchRow[];
  seasonStages?: SeasonStage[];
  /** 首頁精簡列表不分段 */
  flat?: boolean;
}

function formatDateUtc(dateStr: string, lang: Lang): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      lang === 'en' ? 'en-HK' : lang === 'zh-cn' ? 'zh-CN' : 'zh-HK',
      { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
    );
  } catch {
    return dateStr;
  }
}

function getStatusText(status: string, isMatchEnd: boolean, lang: Lang): string {
  const t = UI_TEXT[lang];
  if (isMatchEnd || status === 'completed') return t.completed;
  if (status === 'in_progress' || status === 'live') return t.inProgress;
  return t.upcomingMatch;
}

function ScoreCell({ match, lang }: { match: MatchRow; lang: Lang }) {
  const t = UI_TEXT[lang];
  if (!match.isMatchEnd) {
    return (
      <div className="text-center">
        <span className="text-xs font-medium text-gray-600">{t.upcomingMatch}</span>
        <div className="text-xs text-gray-500 mt-0.5">
          {formatMatchDateTimeHK(match.date, lang)}
        </div>
      </div>
    );
  }
  if (match.homeScore !== null && match.awayScore !== null) {
    return (
      <span className="font-bold text-primary text-base">
        {match.homeScore} - {match.awayScore}
      </span>
    );
  }
  return <span className="text-gray-400">-</span>;
}

function TeamLink({
  name,
  url,
}: {
  name: string;
  url?: string;
}) {
  if (!url) return <>{name}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:text-orange transition-colors underline-offset-2 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </a>
  );
}

function MatchCard({ match, lang }: { match: MatchRow; lang: Lang }) {
  const rowClick = match.matchUrl
    ? () => window.open(match.matchUrl, '_blank', 'noopener,noreferrer')
    : undefined;

  return (
    <div
      role={rowClick ? 'button' : undefined}
      tabIndex={rowClick ? 0 : undefined}
      onClick={rowClick}
      onKeyDown={(e) => {
        if (rowClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          rowClick();
        }
      }}
      className={`border border-gray-100 rounded-lg p-4 space-y-3 bg-white ${
        rowClick ? 'cursor-pointer hover:bg-orange/5 transition-colors' : ''
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <TeamLogo
          name={match.homeTeam}
          imageUrl={match.homeTeamImage}
          abbreviation={match.homeTeamAbbreviation}
          size={36}
        />
        <div className="min-w-0 flex-1 text-sm font-medium text-gray-800 truncate">
          <TeamLink name={match.homeTeam} url={match.homeTeamUrl} />
        </div>
        <div className="shrink-0 px-2">
          <ScoreCell match={match} lang={lang} />
        </div>
        <div className="min-w-0 flex-1 text-sm font-medium text-gray-800 truncate text-right">
          <TeamLink name={match.awayTeam} url={match.awayTeamUrl} />
        </div>
        <TeamLogo
          name={match.awayTeam}
          imageUrl={match.awayTeamImage}
          abbreviation={match.awayTeamAbbreviation}
          size={36}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span>{formatMatchDateTimeHK(match.date, lang)}</span>
        {match.location && (
          <>
            <span className="text-gray-300">·</span>
            <span className="truncate max-w-full">{match.location}</span>
          </>
        )}
        {match.youtube && (
          <YoutubeReplayButton youtubeUrl={match.youtube} lang={lang} />
        )}
      </div>
    </div>
  );
}

function MatchTableRow({ match, lang }: { match: MatchRow; lang: Lang }) {
  const rowContent = (
    <>
      <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
        {formatDateUtc(match.date, lang)}
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <TeamLogo
            name={match.homeTeam}
            imageUrl={match.homeTeamImage}
            abbreviation={match.homeTeamAbbreviation}
            size={24}
          />
          <TeamLink name={match.homeTeam} url={match.homeTeamUrl} />
        </div>
        <div className="text-gray-400 text-xs my-0.5">vs</div>
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <TeamLogo
            name={match.awayTeam}
            imageUrl={match.awayTeamImage}
            abbreviation={match.awayTeamAbbreviation}
            size={24}
          />
          <TeamLink name={match.awayTeam} url={match.awayTeamUrl} />
        </div>
      </td>
      <td className="py-3 px-2 text-center">
        <ScoreCell match={match} lang={lang} />
      </td>
      <td className="py-3 px-2 text-center hidden sm:table-cell">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            match.isMatchEnd
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {getStatusText(match.status, match.isMatchEnd, lang)}
        </span>
      </td>
      <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">
        {match.location || '-'}
      </td>
      <td className="py-3 px-2 text-center w-12">
        {match.youtube ? (
          <YoutubeReplayButton youtubeUrl={match.youtube} lang={lang} />
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    </>
  );

  if (match.matchUrl) {
    return (
      <tr
        key={match.id}
        className="border-b border-gray-100 hover:bg-orange/5 transition-colors cursor-pointer"
        onClick={() => window.open(match.matchUrl, '_blank', 'noopener,noreferrer')}
      >
        {rowContent}
      </tr>
    );
  }

  return (
    <tr
      key={match.id}
      className="border-b border-gray-100 hover:bg-orange/5 transition-colors"
    >
      {rowContent}
    </tr>
  );
}

function MatchesTableDesktop({
  lang,
  matches,
}: {
  lang: Lang;
  matches: MatchRow[];
}) {
  const t = UI_TEXT[lang];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-primary/10">
          <th className="text-left py-3 px-2 font-semibold text-primary w-28">
            {t.date}
          </th>
          <th className="text-left py-3 px-2 font-semibold text-primary">
            {t.match}
          </th>
          <th className="text-center py-3 px-2 font-semibold text-primary w-28">
            {t.score}
          </th>
          <th className="text-center py-3 px-2 font-semibold text-primary w-20 hidden sm:table-cell">
            {t.status}
          </th>
          <th className="text-left py-3 px-2 font-semibold text-primary hidden md:table-cell">
            {t.location}
          </th>
          <th className="text-center py-3 px-2 font-semibold text-primary w-12">
            {t.replay}
          </th>
        </tr>
      </thead>
      <tbody>
        {matches.map((match) => (
          <MatchTableRow key={match.id} match={match} lang={lang} />
        ))}
      </tbody>
    </table>
  );
}

/** 赛程与结果表格 */
export default function MatchesTable({
  lang,
  matches,
  seasonStages,
  flat = false,
}: MatchesTableProps) {
  const t = UI_TEXT[lang];

  if (matches.length === 0) {
    return <p className="text-gray-500 text-center py-8">{t.noData}</p>;
  }

  const groups = flat
    ? [{ stageId: null, title: '', matches }]
    : groupMatchesByStage(matches, seasonStages, lang);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.stageId ?? 'all'}>
          {group.title && (
            <h3 className="font-heading text-lg font-bold text-primary mb-4">
              {group.title}
            </h3>
          )}
          <div className="md:hidden space-y-3">
            {group.matches.map((match) => (
              <MatchCard key={match.id} match={match} lang={lang} />
            ))}
          </div>
          <div className="hidden md:block table-scroll">
            <MatchesTableDesktop lang={lang} matches={group.matches} />
          </div>
        </div>
      ))}
    </div>
  );
}
