'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Lang, SiteConfig } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import LoadingSpinner from './LoadingSpinner';

interface MatchesContentProps {
  lang: Lang;
  config: SiteConfig;
}

/**
 * 比赛页面 — 直接导向 ScoreLab 赛季页面，不再另行抓取重组数据。
 * ScoreLab 回传 X-Frame-Options: DENY，无法在本站 iframe 嵌入其版面，
 * 因此以联赛选择 + 开启对应赛季 URL 的方式显示其官方比赛版面。
 */
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

  const handleTabChange = (tab: 'latest' | 'archive') => {
    setActiveTab(tab);
    const list =
      tab === 'latest' ? config.matches.leagues : config.matches.archiveLeagues;
    if (list.length > 0) {
      setSelectedId(list[0].id);
    }
  };

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

          {selectedLeague && (
            <div className="scorelab-iframe-container">
              <div className="flex flex-col items-center justify-center gap-5 px-6 py-16 md:py-24 text-center min-h-[420px]">
                <div>
                  <p className="font-heading text-2xl font-bold text-primary mb-3">
                    {selectedLeague.league} — {selectedLeague.season}
                  </p>
                  <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                    {t.scorelabEmbedHint}
                  </p>
                </div>
                <a
                  href={selectedLeague.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-orange text-white font-semibold rounded-lg hover:bg-orange/90 transition-colors"
                >
                  {t.openOnScorelab}
                </a>
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
