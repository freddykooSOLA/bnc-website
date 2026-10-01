import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { SECTION_COPY } from '@/lib/section-copy';
import { SHOP_CATEGORIES, SHOP_PRODUCTS, samplePriceLabel } from '@/lib/shop-catalog';
import type { Lang } from '@/types';
import SampleTile from '@/components/SampleTile';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const copy = SECTION_COPY[params.lang];
  const title = {
    'zh-hk': '商店 | BNC 籃球聯賽',
    'zh-cn': '商店 | BNC 篮球联赛',
    en: 'Shop | BNC Basketball League',
  };
  const description = {
    'zh-hk': copy.sampleBanner,
    'zh-cn': SECTION_COPY['zh-cn'].sampleBanner,
    en: SECTION_COPY.en.sampleBanner,
  };
  return generatePageMetadata(params.lang, getConfig(), { title, description }, '/shop');
}

export default function ShopPage({ params }: { params: { lang: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];

  return (
    <div className="bg-light-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h1 className="font-heading text-3xl font-bold text-primary">{copy.shop}</h1>
          <Link href={`/${lang}/shop/cart`} className="text-sm font-semibold text-orange">{copy.cart}</Link>
        </div>
        <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-900 mb-8">{copy.sampleBanner}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1.5 rounded-full bg-orange text-white text-sm">{copy.allCategories}</span>
          {SHOP_CATEGORIES.map((category) => (
            <Link key={category.id} href={`/${lang}/shop/${category.id}`} className="px-3 py-1.5 rounded-full bg-white border text-sm text-primary">
              {category.name[lang]}
            </Link>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHOP_PRODUCTS.map((product) => (
            <Link key={product.slug} href={`/${lang}/shop/product/${product.slug}`} className="card hover:border-orange">
              <SampleTile label={product.name[lang]} />
              <h2 className="mt-4 font-semibold text-primary">{product.name[lang]}</h2>
              <p className="text-xs text-orange mt-1">{copy.pricePending}</p>
              <p className="text-sm">{samplePriceLabel(lang, product.samplePriceHkd)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
