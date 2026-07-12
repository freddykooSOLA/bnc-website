'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Lang, SeasonData, SiteConfig } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import StandingsTable from './StandingsTable';
import MatchesTable from './MatchesTable';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface MatchesContentProps {
  lang: Lang;
  config: SiteConfig;
}

/** 比赛页面 — 实时从 ScoreLab 获取数据并展示 */
function MatchesContentInner({ lang, config }: MatchesContentProps) {
  const t = UI_TEXT[lang];
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get('season');

  const [activeTab, setActiveTab] = useState<'latest' | 'archive'>('latest');

  const leagues =
    activeTab === 'latest' ? config.matches.leagues : config.matches.archiveLeagues;

  const initialLeagueId =
    (seasonParam && leagues.some((l) => l.id === seasonParam)
      ? seasonParam
      : null) ?? config.matches.defaultLeagueId;

  const [selectedId, setSelectedId] = useState(initialLeagueId);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const selectedLeague =
    leagues.find((l) => l.id === selectedId) ?? leagues[0] ?? null;

  useEffect(() => {
    if (seasonParam && leagues.some((l) => l.id === seasonParam)) {
      setSelectedId(seasonParam);
    }
  }, [seasonParam, leagues]);

  useEffect(() => {
    if (leagues.length > 0 && !leagues.some((l) => l.id === selectedId)) {
      setSelectedId(leagues[0].id);
    }
  }, [leagues, selectedId]);

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
      setSeasonData(await res.json());
    } catch {
      if (!silent) {
        setError(true);
        setSeasonData(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const handleTabChange = (tab: 'latest' | 'archive') => {
    setActiveTab(tab);
    const list =
      tab === 'latest' ? config.matches.leagues : config.matches.archiveLeagues;
    if (list.length > 0) {
      setSelectedId(list[0].id);
    }
  };

  useEffect(() => {
    if (selectedLeague) {
      fetchData(selectedLeague.id);
    } else {
      setLoading(false);
      setSeasonData(null);
    }
  }, [selectedLeague, fetchData]);

  // 页面可见时及每 5 分钟自动刷新数据
  useEffect(() => {
    if (!selectedLeague) return;

    const refresh = () => fetchData(selectedLeague.id, true);

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(refresh, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, [selectedLeague, fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-8">
        {config.nav.matches[lang]}
      </h1>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange('latest')}
          className={`pb-3 text-sm md:text-base transition-colors ${
            activeTab === 'latest' ? 'tab-active' : 'tab-inactive'
          }`}
        >
          {t.latestMatches}
        </button>
        {config.matches.showArchive && (
          <button
            onClick={() => handleTabChange('archive')}
            className={`pb-3 text-sm md:text-base transition-colors ${
              activeTab === 'archive' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {t.archiveMatches}
          </button>
        )}
      </div>

      {leagues.length > 0 ? (
        <>
          <div className="mb-6">
            <select
              id="league-select"
              value={selectedLeague?.id ?? ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-200 rounded-lg bg-white text-primary font-medium focus:ring-2 focus:ring-orange focus:border-orange outline-none"
            >
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.league} — {league.season}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <LoadingSpinner lang={lang} />
          ) : error ? (
            <ErrorMessage lang={lang} />
          ) : (
            <div className="space-y-8">
              <div className="card">
                <h2 className="font-heading text-xl font-bold text-primary mb-6">
                  {t.standings}
                </h2>
                <StandingsTable
                  lang={lang}
                  standings={seasonData?.standings ?? []}
                />
              </div>

              <div className="card">
                <h2 className="font-heading text-xl font-bold text-primary mb-6">
                  {t.schedule}
                </h2>
                <MatchesTable lang={lang} matches={seasonData?.matches ?? []} />
              </div>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-6">
            {t.scorelabCredit}
          </p>
        </>
      ) : (
        <div className="card text-center text-gray-500 py-12">{t.noData}</div>
      )}
    </div>
  );
}

export default function MatchesContent(props: MatchesContentProps) {
  return (
    <Suspense fallback={<LoadingSpinner lang={props.lang} />}>
      <MatchesContentInner {...props} />
    </Suspense>
  );
}
