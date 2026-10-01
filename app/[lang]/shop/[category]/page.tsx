import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { SECTION_COPY } from '@/lib/section-copy';
import { getCategory, productsInCategory, samplePriceLabel } from '@/lib/shop-catalog';
import type { Lang } from '@/types';
import SampleTile from '@/components/SampleTile';

export async function generateMetadata({
  params,
}: {
  params: { lang: string; category: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const category = getCategory(params.category);
  if (!category) return {};
  return generatePageMetadata(
    params.lang,
    getConfig(),
    { title: category.name, description: category.blurb },
    `/shop/${category.id}`
  );
}

export default function CategoryPage({ params }: { params: { lang: string; category: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const category = getCategory(params.category);
  if (!category) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];

  return (
    <div className="bg-light-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${lang}/shop`} className="text-sm text-orange">{copy.back}</Link>
        <h1 className="font-heading text-3xl font-bold text-primary mt-3">{category.name[lang]}</h1>
        <p className="text-gray-600 mt-2 mb-8">{category.blurb[lang]}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsInCategory(category.id).map((product) => (
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
