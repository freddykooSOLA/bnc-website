'use client';

import type { Lang, MatchRow } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import { parseYoutubeVideoId, youtubeThumbnail } from '@/lib/scorelab-helpers';

interface MatchHighlightsProps {
  lang: Lang;
  matches: MatchRow[];
}

/** 首頁最新精華（ScoreLab 賽事 YouTube） */
export default function MatchHighlights({ lang, matches }: MatchHighlightsProps) {
  const t = UI_TEXT[lang];

  const withVideo = matches
    .filter((m) => m.isMatchEnd && m.youtube)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (withVideo.length === 0) return null;

  return (
    <div className="card">
      <h2 className="font-heading text-lg font-bold text-primary mb-4">
        {t.latestHighlights}
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {withVideo.map((m) => {
          const id = parseYoutubeVideoId(m.youtube!);
          if (!id) return null;
          const thumb = youtubeThumbnail(id);
          return (
            <a
              key={m.id}
              href={m.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg overflow-hidden border border-gray-100 hover:border-orange/40 transition-colors"
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={thumb}
                  alt={`${m.homeTeam} vs ${m.awayTeam}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {m.homeTeam} vs {m.awayTeam}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
