'use client';

import type { Lang, SiteConfig } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface FacebookFeedProps {
  lang: Lang;
  config: SiteConfig;
}

/** Facebook 最新贴文 — 使用官方 Page Plugin 嵌入 */
export default function FacebookFeed({ lang, config }: FacebookFeedProps) {
  const t = UI_TEXT[lang];
  const pageUrl = encodeURIComponent(config.socialLinks.facebook);

  return (
    <section className="bg-light-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-8 text-center md:text-left">
          {t.facebookFeed}
        </h2>

        <div className="flex justify-center">
          <div className="card p-0 overflow-hidden w-full max-w-[500px]">
            <iframe
              title="Facebook Page Feed"
              src={`https://www.facebook.com/plugins/page.php?href=${pageUrl}&tabs=timeline&width=500&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`}
              width="100%"
              height="500"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              allow="encrypted-media"
              className="w-full min-h-[400px] md:min-h-[500px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
