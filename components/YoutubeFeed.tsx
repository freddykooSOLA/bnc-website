'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Lang, YoutubeVideo } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import LoadingSpinner from './LoadingSpinner';

interface YoutubeFeedProps {
  lang: Lang;
}

/** YouTube 最新影片区块 */
export default function YoutubeFeed({ lang }: YoutubeFeedProps) {
  const t = UI_TEXT[lang];
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/youtube')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setVideos(data.videos ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-8">
        {t.latestVideos}
      </h2>

      {loading ? (
        <LoadingSpinner lang={lang} />
      ) : error || videos.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">{t.noVideos}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group hover:shadow-md transition-shadow p-0 overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-primary line-clamp-2 group-hover:text-orange transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(video.publishedAt).toLocaleDateString(lang)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
