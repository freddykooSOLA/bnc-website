'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Lang, LeagueConfig, SeasonData } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import StandingsTable from './StandingsTable';
import MatchesTable from './MatchesTable';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import StatLeaders from './StatLeaders';
import NextMatchCard from './NextMatchCard';
import RecentResultsStrip from './RecentResultsStrip';
import MatchHighlights from './MatchHighlights';
import { compareMatchDateAsc, compareMatchDateDesc } from '@/lib/scorelab-time';

interface LeagueSelectorProps {
  lang: Lang;
  leagues: LeagueConfig[];
  defaultLeagueId: string;
}

/** 首页联赛选择器 — 动态显示排名、赛果、赛程 */
export default function LeagueSelector({
  lang,
  leagues,
  defaultLeagueId,
}: LeagueSelectorProps) {
  const t = UI_TEXT[lang];
  const [selectedId, setSelectedId] = useState(defaultLeagueId);
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const selectedLeague = leagues.find((l) => l.id === selectedId) ?? leagues[0];

  const fetchData = useCallback(async (leagueId: string, silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    try {
      const res = await fetch(`/api/scorelab?seasonId=${leagueId}&_=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch {
      if (!silent) {
        setError(true);
        setData(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedId);
  }, [selectedId, fetchData]);

  useEffect(() => {
    const refresh = () => fetchData(selectedId, true);

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(refresh, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, [selectedId, fetchData]);

  const completedMatches = useMemo(
    () =>
      data?.matches
        .filter((m) => m.isMatchEnd)
        .slice()
        .sort((a, b) => compareMatchDateDesc(a.date, b.date)) ?? [],
    [data?.matches]
  );

  const recentThree = completedMatches.slice(0, 3);
  const completedForTable = completedMatches.slice(0, 5);
  const upcomingMatches =
    data?.matches
      .filter((m) => !m.isMatchEnd)
      .slice()
      .sort((a, b) => compareMatchDateAsc(a.date, b.date))
      .slice(0, 5) ?? [];

  const nextUpcoming = useMemo(() => {
    const list =
      data?.matches
        .filter((m) => !m.isMatchEnd)
        .slice()
        .sort((a, b) => compareMatchDateAsc(a.date, b.date)) ?? [];
    return list[0] ?? null;
  }, [data?.matches]);

  return (
    <section className="bg-light-bg py-12 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-sm font-medium text-primary">{t.selectLeague}:</span>
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedId(league.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedId === league.id
                  ? 'bg-orange text-white'
                  : 'bg-white text-primary border border-primary/20 hover:border-orange hover:text-orange'
              }`}
            >
              {league.season}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner lang={lang} />
        ) : error ? (
          <ErrorMessage lang={lang} scorelabUrl={selectedLeague?.url} />
        ) : (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {nextUpcoming ? (
                <NextMatchCard lang={lang} match={nextUpcoming} />
              ) : null}
              <RecentResultsStrip lang={lang} matches={recentThree} />
            </div>

            <MatchHighlights lang={lang} matches={data?.matches ?? []} />

            <StatLeaders
              lang={lang}
              topPlayers={data?.topPlayers}
              compact
              leagueId={selectedId}
            />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="card">
                <h2 className="font-heading text-lg font-bold text-primary mb-4">
                  {t.standings}
                </h2>
                <StandingsTable
                  lang={lang}
                  standings={data?.standings ?? []}
                  compact
                  sortable
                  leagueId={selectedId}
                />
              </div>
              <div className="card">
                <h2 className="font-heading text-lg font-bold text-primary mb-4">
                  {t.recentResults}
                </h2>
                <MatchesTable
                  lang={lang}
                  matches={completedForTable}
                  flat
                  leagueId={selectedId}
                />
              </div>
              <div className="card">
                <h2 className="font-heading text-lg font-bold text-primary mb-4">
                  {t.upcoming}
                </h2>
                <MatchesTable
                  lang={lang}
                  matches={upcomingMatches}
                  flat
                  leagueId={selectedId}
                />
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">{t.scorelabCredit}</p>
      </div>
    </section>
  );
}
