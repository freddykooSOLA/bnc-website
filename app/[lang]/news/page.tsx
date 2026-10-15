import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang, UI_TEXT } from '@/lib/i18n';
import type { Lang } from '@/types';
import {
  NEWS_PAGE_SIZE,
  allLeaguesFromConfig,
  fetchCompletedNewsMatches,
} from '@/lib/match-news';
import NewsListContent from '@/components/NewsListContent';

interface PageProps {
  params: { lang: string };
  searchParams: { page?: string; league?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang as Lang;
  if (!isValidLang(lang)) return {};
  const config = getConfig();
  const t = UI_TEXT[lang];
  return {
    title: `${t.newsTitle} | ${config.siteName[lang]}`,
    description: t.newsMetaDescription,
  };
}

export default async function NewsPage({ params, searchParams }: PageProps) {
  const lang = params.lang as Lang;
  if (!isValidLang(lang)) notFound();

  const t = UI_TEXT[lang];
  const leagueFilter = searchParams.league?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);

  const all = await fetchCompletedNewsMatches(leagueFilter || undefined);
  const totalPages = Math.max(1, Math.ceil(all.length / NEWS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = all.slice(
    (safePage - 1) * NEWS_PAGE_SIZE,
    safePage * NEWS_PAGE_SIZE
  );

  const leagues = allLeaguesFromConfig().map((l) => ({
    id: l.id,
    label: l.league,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 overflow-x-hidden">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
        {t.newsTitle}
      </h1>
      <p className="text-gray-600 mb-10">{t.newsMetaDescription}</p>
      <NewsListContent
        lang={lang}
        items={slice}
        page={safePage}
        totalPages={totalPages}
        leagueFilter={leagueFilter}
        leagues={leagues}
      />
    </div>
  );
}
