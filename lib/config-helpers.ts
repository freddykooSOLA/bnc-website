import type { SiteConfig, LocalizedString } from '@/types';
import { expandLocalized } from '@/lib/translate';

/** 从繁体中文生成三语配置（无 fs 依赖，客户端可用） */
export function buildConfigFromZhHk(input: {
  siteName: string;
  nav: { home: string; about: string; matches: string };
  hero: { title: string; subtitle: string; ctaText: string; backgroundImage: string };
  about: { content: string };
  footer: { copyright: string };
  contact: { phone: string; email: string; address: string; googleMapEmbedUrl: string };
  seo: {
    home: { title: string; description: string; keywords: string };
    about: { title: string; description: string };
    matches: { title: string; description: string };
  };
  matches: SiteConfig['matches'];
  socialLinks: SiteConfig['socialLinks'];
  logo: string;
  favicon: string;
  defaultLang: SiteConfig['defaultLang'];
}): SiteConfig {
  return {
    siteName: expandLocalized(input.siteName),
    logo: input.logo,
    favicon: input.favicon,
    defaultLang: input.defaultLang,
    contact: {
      phone: input.contact.phone,
      email: input.contact.email,
      address: expandLocalized(input.contact.address),
      googleMapEmbedUrl: input.contact.googleMapEmbedUrl,
    },
    socialLinks: input.socialLinks,
    nav: {
      home: expandLocalized(input.nav.home),
      about: expandLocalized(input.nav.about),
      matches: expandLocalized(input.nav.matches),
    },
    hero: {
      title: expandLocalized(input.hero.title),
      subtitle: expandLocalized(input.hero.subtitle),
      ctaText: expandLocalized(input.hero.ctaText),
      backgroundImage: input.hero.backgroundImage,
    },
    about: { content: expandLocalized(input.about.content) },
    matches: input.matches,
    footer: { copyright: expandLocalized(input.footer.copyright) },
    seo: {
      home: {
        title: expandLocalized(input.seo.home.title),
        description: expandLocalized(input.seo.home.description),
        keywords: expandLocalized(input.seo.home.keywords),
      },
      about: {
        title: expandLocalized(input.seo.about.title),
        description: expandLocalized(input.seo.about.description),
      },
      matches: {
        title: expandLocalized(input.seo.matches.title),
        description: expandLocalized(input.seo.matches.description),
      },
    },
  };
}

/** 从完整配置提取繁体中文编辑字段 */
export function extractZhHkFields(config: SiteConfig) {
  const pick = (ls: LocalizedString) => ls['zh-hk'];
  return {
    siteName: pick(config.siteName),
    nav: {
      home: pick(config.nav.home),
      about: pick(config.nav.about),
      matches: pick(config.nav.matches),
    },
    hero: {
      title: pick(config.hero.title),
      subtitle: pick(config.hero.subtitle),
      ctaText: pick(config.hero.ctaText),
      backgroundImage: config.hero.backgroundImage,
    },
    about: { content: pick(config.about.content) },
    footer: { copyright: pick(config.footer.copyright) },
    contact: {
      phone: config.contact.phone,
      email: config.contact.email,
      address: pick(config.contact.address),
      googleMapEmbedUrl: config.contact.googleMapEmbedUrl,
    },
    seo: {
      home: {
        title: pick(config.seo.home.title),
        description: pick(config.seo.home.description),
        keywords: pick(config.seo.home.keywords),
      },
      about: {
        title: pick(config.seo.about.title),
        description: pick(config.seo.about.description),
      },
      matches: {
        title: pick(config.seo.matches.title),
        description: pick(config.seo.matches.description),
      },
    },
    matches: config.matches,
    socialLinks: config.socialLinks,
    logo: config.logo,
    favicon: config.favicon,
    defaultLang: config.defaultLang,
  };
}
