import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isValidLang } from '@/lib/i18n';
import { SECTION_COPY } from '@/lib/section-copy';
import { findOrder } from '@/lib/ledger';
import { isRef } from '@/lib/codes';
import type { Lang } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function OrderPage({ params }: { params: { lang: string; ref: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const ref = params.ref.toUpperCase();
  if (!isRef(ref, 'BNC-S')) notFound();
  const order = await findOrder(ref);
  if (!order) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];

  return (
    <div className="bg-light-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-primary">{copy.orderTitle}</h1>
        <p className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-900">{copy.orderMock}</p>
        <p className="mt-6 font-mono text-orange">{order.ref}</p>
        <p className="text-primary font-semibold mt-2">{order.name}</p>
        <ul className="mt-6 space-y-3">
          {order.lines.map((line, index) => (
            <li key={`${line.slug}-${index}`} className="card">
              <p className="font-semibold">{line.name} × {line.qty}</p>
              <p className="text-sm text-gray-500">{[line.size, line.color, line.teamName].filter(Boolean).join(' · ')}</p>
              <p className="text-sm">{copy.pricePending} · HKD {line.samplePriceHkd * line.qty}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-semibold text-primary">HKD {order.sampleTotalHkd}</p>
        <Link href={`/${lang}/shop`} className="inline-block mt-6 text-sm text-orange">{copy.continueShop}</Link>
      </div>
    </div>
  );
}
