import type { Metadata } from 'next';
import type { Lang, SiteConfig, LocalizedString } from '@/types';
import { HREFLANG_MAP, LANGUAGES } from '@/lib/i18n';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

interface LocalizedSeoConfig {
  title: LocalizedString;
  description: LocalizedString;
  keywords?: LocalizedString;
}

/** 生成页面 SEO 元数据 */
export function generatePageMetadata(
  lang: Lang,
  config: SiteConfig,
  pageSeo: LocalizedSeoConfig,
  path: string
): Metadata {
  const title = pageSeo.title[lang];
  const description = pageSeo.description[lang];
  const keywords = pageSeo.keywords?.[lang];

  const alternateLanguages: Record<string, string> = {};
  for (const l of LANGUAGES) {
    alternateLanguages[HREFLANG_MAP[l]] = `${BASE_URL}/${l}${path}`;
  }
  alternateLanguages['x-default'] = `${BASE_URL}/${config.defaultLang}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/${lang}${path}`,
      languages: alternateLanguages,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${lang}${path}`,
      siteName: config.siteName[lang],
      locale: HREFLANG_MAP[lang].replace('-', '_'),
      type: 'website',
      images: [
        {
          url: `${BASE_URL}${config.logo}`,
          width: 512,
          height: 512,
          alt: config.siteName[lang],
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}${config.logo}`],
    },
    other: {
      'geo.region': 'HK',
      'geo.placename': 'Hong Kong',
    },
  };
}

/** 生成 JSON-LD 结构化数据 */
export function generateJsonLd(config: SiteConfig, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: config.siteName[lang],
        url: BASE_URL,
        logo: `${BASE_URL}${config.logo}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Hong Kong',
          addressCountry: 'HK',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: config.contact.email,
          contactType: 'customer service',
        },
      },
      {
        '@type': 'SportsOrganization',
        name: config.siteName[lang],
        sport: 'Basketball',
        location: {
          '@type': 'Place',
          name: 'Hong Kong',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'HK',
          },
        },
      },
    ],
  };
}
