import Link from 'next/link';
import type { Lang } from '@/types';
import { SECTION_COPY } from '@/lib/section-copy';

export default function ShopEventsBand({ lang }: { lang: Lang }) {
  const copy = SECTION_COPY[lang];
  const cards = [
    { href: `/${lang}/shop`, title: copy.homeShop, body: copy.homeShopBody },
    { href: `/${lang}/events`, title: copy.homeEvents, body: copy.homeEventsBody },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="card hover:border-orange transition-colors">
            <h2 className="font-heading text-xl font-bold text-primary">{card.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{card.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
