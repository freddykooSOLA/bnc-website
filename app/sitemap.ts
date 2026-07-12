import type { MetadataRoute } from 'next';
import { LANGUAGES } from '@/lib/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

const PAGES = ['', '/about', '/matches'];

/** 自动生成 sitemap.xml */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of LANGUAGES) {
    for (const page of PAGES) {
      entries.push({
        url: `${BASE_URL}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
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
