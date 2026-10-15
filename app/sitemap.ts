import type { MetadataRoute } from 'next';
import { LANGUAGES } from '@/lib/i18n';
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/lib/shop-catalog';
import { LEAGUE_EVENTS } from '@/lib/events-catalog';
import { getConfig } from '@/lib/config';
import { getCachedSeasonData } from '@/lib/scorelab-cache';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

/** ScoreLab 資料在 build 時可能不可用；請求時生成 */
export const dynamic = 'force-dynamic';
export const revalidate = 300;

const STATIC_PAGES = [
  '',
  '/about',
  '/matches',
  '/hall-of-fame',
  '/news',
  '/shop',
  '/events',
  ...SHOP_CATEGORIES.map((category) => `/shop/${category.id}`),
  ...SHOP_PRODUCTS.map((product) => `/shop/product/${product.slug}`),
  ...LEAGUE_EVENTS.map((event) => `/events/${event.slug}`),
];

async function scorelabDynamicPaths(): Promise<string[]> {
  const config = getConfig();
  const leagues = [...config.matches.leagues, ...config.matches.archiveLeagues];
  const paths: string[] = [];
  const seen = new Set<string>();

  for (const league of leagues) {
    try {
      const data = await getCachedSeasonData(league.url);
      for (const team of data.standings) {
        if (!team.teamId) continue;
        const path = `/teams/${league.id}/${team.teamId}`;
        if (!seen.has(path)) {
          seen.add(path);
          paths.push(path);
        }
      }
      if (data.playerStats) {
        for (const playerId of Object.keys(data.playerStats)) {
          const path = `/players/${league.id}/${playerId}`;
          if (!seen.has(path)) {
            seen.add(path);
            paths.push(path);
          }
        }
      }
      for (const match of data.matches) {
        if (match.isMatchEnd && match.id) {
          const path = `/news/${league.id}/${match.id}`;
          if (!seen.has(path)) {
            seen.add(path);
            paths.push(path);
          }
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
  const dynamicPaths = await scorelabDynamicPaths();
  const pages = [...STATIC_PAGES, ...dynamicPaths];
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGUAGES) {
    for (const page of pages) {
      const isTeam = page.startsWith('/teams/');
      const isPlayer = page.startsWith('/players/');
      const isNews = page.startsWith('/news/');
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === ''
          ? 1
          : isTeam || isPlayer
            ? 0.7
            : isNews
              ? 0.65
              : 0.8,
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
