'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Lang, SiteConfig } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface FacebookFeedProps {
  lang: Lang;
  config: SiteConfig;
}

interface FacebookPost {
  message: string;
  createdAt: string;
  url: string;
  image?: string;
}

/** 有專頁權杖時顯示最近 3 帖。沒有權杖時只嵌時間線，不顯示專頁封面。 */
export default function FacebookFeed({ lang, config }: FacebookFeedProps) {
  const t = UI_TEXT[lang];
  const [posts, setPosts] = useState<FacebookPost[] | null>(null);
  const pageUrl = encodeURIComponent(config.socialLinks.facebook);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/facebook')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setPosts(Array.isArray(data.posts) ? data.posts.slice(0, 3) : []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dated = (value: string) => !Number.isNaN(Date.parse(value));

  return (
    <section className="bg-light-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary">
            {t.facebookFeed}
          </h2>
          <a
            href={config.socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-orange shrink-0"
          >
            {t.viewOnFacebook}
          </a>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const caption = post.message.trim().split('\n').find((line) => line.trim())?.trim() ?? '';
              return (
                <a
                  key={post.url}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`card group hover:shadow-md transition-shadow overflow-hidden ${post.image ? 'p-0' : ''}`}
                >
                  {post.image ? (
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image
                        src={post.image}
                        alt={caption.slice(0, 80) || t.facebookFeed}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <div className={post.image ? 'p-4' : ''}>
                    <p className="text-sm text-gray-800 leading-relaxed line-clamp-4">
                      {post.message || t.viewOnFacebook}
                    </p>
                    {dated(post.createdAt) ? (
                      <p className="text-xs text-gray-400 mt-4">
                        {new Date(post.createdAt).toLocaleDateString(lang)}
                      </p>
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="max-w-[520px]">
            {posts === null ? (
              <div className="card min-h-[420px] bg-gray-50" aria-hidden />
            ) : (
              <iframe
                title="Facebook Page Feed"
                src={`https://www.facebook.com/plugins/page.php?href=${pageUrl}&tabs=timeline&width=500&height=680&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false`}
                width="100%"
                height="680"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                loading="lazy"
                allow="encrypted-media"
                className="w-full bg-white"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
