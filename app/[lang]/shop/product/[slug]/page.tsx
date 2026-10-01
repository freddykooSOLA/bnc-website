import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { SECTION_COPY } from '@/lib/section-copy';
import { getCategory, getProduct } from '@/lib/shop-catalog';
import type { Lang } from '@/types';
import AddToCartForm from '@/components/AddToCartForm';
import SampleTile from '@/components/SampleTile';

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const product = getProduct(params.slug);
  if (!product) return {};
  return generatePageMetadata(params.lang, getConfig(), {
    title: product.name,
    description: product.summary,
  }, `/shop/product/${product.slug}`);
}

export default function ProductPage({ params }: { params: { lang: string; slug: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const product = getProduct(params.slug);
  if (!product) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];
  const category = getCategory(product.category);

  return (
    <div className="bg-light-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-2 gap-8">
        <div>
          <Link href={`/${lang}/shop/${product.category}`} className="text-sm text-orange">
            {category?.name[lang]}
          </Link>
          <div className="mt-4">
            <SampleTile label={product.name[lang]} />
          </div>
        </div>
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">{product.name[lang]}</h1>
          <p className="mt-3 text-gray-600">{product.summary[lang]}</p>
          <div className="mt-6">
            <AddToCartForm lang={lang} product={product} />
          </div>
          <Link href={`/${lang}/shop/cart`} className="inline-block mt-4 text-sm text-primary">
            {copy.cart}
          </Link>
        </div>
      </div>
    </div>
  );
}
