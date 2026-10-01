import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLang } from '@/lib/i18n';
import { SECTION_COPY } from '@/lib/section-copy';
import type { Lang } from '@/types';
import CheckoutForm from '@/components/CheckoutForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function CheckoutPage({ params }: { params: { lang: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];

  return (
    <div className="bg-light-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-primary mb-6">{copy.checkoutTitle}</h1>
        <CheckoutForm lang={lang} />
      </div>
    </div>
  );
}
