import type { Metadata } from 'next';
import { getConfig } from '@/lib/config';
import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';
import HallOfFameContent from '@/components/HallOfFameContent';
import JsonLd from '@/components/JsonLd';
import { buildHallOfFameItemListJsonLd } from '@/lib/json-ld';
import { getHallOfFameData } from '@/lib/hall-of-fame-data';

interface PageProps {
  params: { lang: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang as Lang;
  const config = getConfig();
  const t = UI_TEXT[lang];
  const site = config.siteName[lang];
  return {
    title: `${t.hofTitle} | ${site}`,
    description: t.hofMetaDescription,
    alternates: {
      languages: {
        'zh-HK': '/zh-hk/hall-of-fame',
        'zh-CN': '/zh-cn/hall-of-fame',
        en: '/en/hall-of-fame',
      },
    },
  };
}

export default function HallOfFamePage({ params }: PageProps) {
  const lang = params.lang as Lang;
  const hofData = getHallOfFameData();
  const jsonLd = buildHallOfFameItemListJsonLd(hofData, lang);

  return (
    <>
      <JsonLd data={jsonLd} />
      <HallOfFameContent lang={lang} />
    </>
  );
}
