'use client';

import Link from 'next/link';
import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { formatMatchDateHK } from '@/lib/scorelab-time';
import type { NewsMatchItem } from '@/lib/match-news';
import { recapScoreTitle } from '@/lib/match-recap';
import { parseYoutubeVideoId, youtubeThumbnail } from '@/lib/scorelab-helpers';

interface NewsListContentProps {
  lang: Lang;
  items: NewsMatchItem[];
  page: number;
  totalPages: number;
  leagueFilter: string;
  leagues: { id: string; label: string }[];
}

export default function NewsListContent({
  lang,
  items,
  page,
  totalPages,
  leagueFilter,
  leagues,
}: NewsListContentProps) {
  const t = UI_TEXT[lang];
  const base = `/${lang}/news`;

  const query = (p: number, league: string) => {
    const params = new URLSearchParams();
    if (p > 1) params.set('page', String(p));
    if (league) params.set('league', league);
    const q = params.toString();
    return q ? `${base}?${q}` : base;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Link
          href={query(1, '')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            !leagueFilter
              ? 'bg-orange text-white'
              : 'bg-gray-100 text-primary hover:bg-orange/10'
          }`}
        >
          {t.newsAllLeagues}
        </Link>
        {leagues.map((l) => (
          <Link
            key={l.id}
            href={query(1, l.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              leagueFilter === l.id
                ? 'bg-orange text-white'
                : 'bg-gray-100 text-primary hover:bg-orange/10'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-12">{t.noData}</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const vid = item.match.youtube
              ? parseYoutubeVideoId(item.match.youtube)
              : null;
            const href = `/${lang}/news/${item.leagueId}/${item.match.id}`;
            return (
              <li key={`${item.leagueId}-${item.match.id}`} className="card flex flex-col">
                {vid && (
                  <a href={href} className="block -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                    <img
                      src={youtubeThumbnail(vid)}
                      alt=""
                      className="w-full aspect-video object-cover"
                    />
                  </a>
                )}
                <p className="text-xs text-orange font-semibold mb-1">
                  {item.season}
                </p>
                <h2 className="font-heading text-lg font-bold text-primary mb-2 leading-snug">
                  <Link href={href} className="hover:text-orange">
                    {recapScoreTitle(item.match)}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {formatMatchDateHK(item.match.date, lang)}
                </p>
                <Link
                  href={href}
                  className="text-sm text-primary hover:text-orange underline mt-auto"
                >
                  {t.newsReadMore}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-4 pt-4">
          {page > 1 && (
            <Link
              href={query(page - 1, leagueFilter)}
              className="text-sm text-primary hover:text-orange underline"
            >
              ←
            </Link>
          )}
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={query(page + 1, leagueFilter)}
              className="text-sm text-primary hover:text-orange underline"
            >
              →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
