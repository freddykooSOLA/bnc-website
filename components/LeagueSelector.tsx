'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lang, LeagueConfig, SeasonData } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import StandingsTable from './StandingsTable';
import MatchesTable from './MatchesTable';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

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

  // 页面可见时及每 5 分钟自动刷新数据
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

  const completedMatches = data?.matches.filter((m) => m.isMatchEnd).slice(0, 5) ?? [];
  const upcomingMatches = data?.matches.filter((m) => !m.isMatchEnd).slice(0, 5) ?? [];

  return (
    <section className="bg-light-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 联赛选择器 */}
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
          <ErrorMessage lang={lang} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card">
              <h2 className="font-heading text-lg font-bold text-primary mb-4">
                {t.standings}
              </h2>
              <StandingsTable lang={lang} standings={data?.standings ?? []} compact />
            </div>
            <div className="card">
              <h2 className="font-heading text-lg font-bold text-primary mb-4">
                {t.recentResults}
              </h2>
              <MatchesTable lang={lang} matches={completedMatches} />
            </div>
            <div className="card">
              <h2 className="font-heading text-lg font-bold text-primary mb-4">
                {t.upcoming}
              </h2>
              <MatchesTable lang={lang} matches={upcomingMatches} />
            </div>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">{t.scorelabCredit}</p>
      </div>
    </section>
  );
}
