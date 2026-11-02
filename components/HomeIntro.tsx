import type { Lang } from '@/types';
import { HOME_H1, homeIntroParagraphs } from '@/lib/home-intro';
import type { SiteConfig } from '@/types';

interface HomeIntroProps {
  lang: Lang;
  config: SiteConfig;
  /** 首屏 Hero 已輸出 H1 時改為 h2，避免重複 */
  headingLevel?: 'h1' | 'h2';
}

/** 首頁 SSR 介紹段（curl 可讀，≥500 字元） */
export default function HomeIntro({ lang, config, headingLevel = 'h1' }: HomeIntroProps) {
  const paragraphs = homeIntroParagraphs(lang, config);
  const Heading = headingLevel;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <Heading className="font-heading text-2xl md:text-3xl font-bold text-primary mb-6">
          {HOME_H1[lang]}
        </Heading>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
