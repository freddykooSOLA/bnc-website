import { getConfig } from '@/lib/config';
import type { Lang } from '@/types';
import Hero from '@/components/Hero';
import HomeIntro from '@/components/HomeIntro';
import LeagueSelector from '@/components/LeagueSelector';
import YoutubeFeed from '@/components/YoutubeFeed';
import FacebookFeed from '@/components/FacebookFeed';

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
      <Hero lang={lang} config={config} />
      <HomeIntro lang={lang} config={config} headingLevel={hasCustomBg ? 'h1' : 'h2'} />
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
