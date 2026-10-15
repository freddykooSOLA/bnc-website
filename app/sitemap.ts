import type { MetadataRoute } from 'next';
import { LANGUAGES } from '@/lib/i18n';
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/lib/shop-catalog';
import { LEAGUE_EVENTS } from '@/lib/events-catalog';
import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

const STATIC_PAGES = [
  '',
  '/about',
  '/matches',
  '/hall-of-fame',
  '/shop',
  '/events',
  ...SHOP_CATEGORIES.map((category) => `/shop/${category.id}`),
  ...SHOP_PRODUCTS.map((product) => `/shop/product/${product.slug}`),
  ...LEAGUE_EVENTS.map((event) => `/events/${event.slug}`),
];

async function teamPagePaths(): Promise<string[]> {
  const config = getConfig();
  const leagues = [
    ...config.matches.leagues,
    ...config.matches.archiveLeagues,
  ];
  const paths: string[] = [];
  const seen = new Set<string>();

  for (const league of leagues) {
    try {
      const data = await getCachedSeasonData(league.url);
      for (const team of data.standings) {
        const path = `/teams/${league.id}/${team.teamId}`;
        if (!seen.has(path)) {
          seen.add(path);
          paths.push(path);
        }
      }
    } catch {
      // skip league if ScoreLab unavailable at build time
    }
  }
  return paths;
}

/** 自动生成 sitemap.xml */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const teamPaths = await teamPagePaths();
  const pages = [...STATIC_PAGES, ...teamPaths];
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGUAGES) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page.startsWith('/teams/') ? 0.7 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            LANGUAGES.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
