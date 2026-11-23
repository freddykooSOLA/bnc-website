import Link from 'next/link';
import Image from 'next/image';
import type { Lang, SiteConfig } from '@/types';
import { HOME_H1 } from '@/lib/home-intro';

interface HeroProps {
  lang: Lang;
  config: SiteConfig;
}

/** 首页英雄区 */
export default function Hero({ lang, config }: HeroProps) {
  const hasCustomBg = Boolean(config.hero.backgroundImage?.startsWith('/uploads/'));

  if (hasCustomBg) {
    return (
      <section className="relative w-full overflow-hidden bg-primary">
        <div className="flex flex-col md:relative md:block">
          <div className="relative w-full aspect-[1024/267] md:min-h-[280px]">
            <Image
              src={config.hero.backgroundImage}
              alt={HOME_H1[lang]}
              fill
              priority
              className="object-contain md:object-cover md:object-center bnc-hero-push"
              sizes="(max-width: 768px) 100vw, 1200px"
              fetchPriority="high"
            />
            <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/40 via-transparent to-transparent md:block" />
          </div>
          <div className="flex justify-center bg-primary px-4 py-3 md:hidden">
            <Link href={`/${lang}/matches`} className="btn-primary min-h-11 text-sm shadow-lg">
              {config.hero.ctaText[lang]}
            </Link>
          </div>
          <div className="absolute bottom-4 left-0 right-0 hidden justify-center px-4 md:bottom-8 md:flex">
            <Link href={`/${lang}/matches`} className="btn-primary min-h-11 text-lg shadow-lg">
              {config.hero.ctaText[lang]}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-primary text-white overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sand rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {HOME_H1[lang]}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl">
          {config.hero.subtitle[lang]}
        </p>
        <Link href={`/${lang}/matches`} className="btn-primary text-lg">
          {config.hero.ctaText[lang]}
        </Link>
      </div>
    </section>
  );
}