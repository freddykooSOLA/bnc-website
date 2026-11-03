import { getConfig } from '@/lib/config';
import type { Lang } from '@/types';
import Hero from '@/components/Hero';
import HomeIntro from '@/components/HomeIntro';
import HomeFaqBlocks from '@/components/HomeFaqBlocks';
import dynamic from 'next/dynamic';

const LeagueSelector = dynamic(() => import('@/components/LeagueSelector'), {
  loading: () => (
    <section className="bg-light-bg py-12 min-h-[200px]" aria-busy="true" aria-label="Loading" />
  ),
});

const YoutubeFeed = dynamic(() => import('@/components/YoutubeFeed'), {
  loading: () => null,
});

const FacebookFeed = dynamic(() => import('@/components/FacebookFeed'), {
  loading: () => null,
});

interface HomePageProps {
  params: { lang: string };
}

/** 首页 */
export default async function HomePage({ params }: HomePageProps) {
  const lang = params.lang as Lang;
  const config = getConfig();

  const hasCustomBg = Boolean(config.hero.backgroundImage?.startsWith('/uploads/'));

  return (
    <>
      {hasCustomBg ? (
        <link
          rel="preload"
          as="image"
          href={config.hero.backgroundImage}
          fetchPriority="high"
        />
      ) : null}
      <Hero lang={lang} config={config} />
      <HomeIntro lang={lang} config={config} headingLevel={hasCustomBg ? 'h1' : 'h2'} />
      <HomeFaqBlocks lang={lang} />
      <LeagueSelector
        lang={lang}
        leagues={config.matches.leagues}
        defaultLeagueId={config.matches.defaultLeagueId}
      />
      <YoutubeFeed lang={lang} />
      <FacebookFeed lang={lang} config={config} />
    </>
  );
}
