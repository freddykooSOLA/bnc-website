import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { SECTION_COPY } from '@/lib/section-copy';
import { LEAGUE_EVENTS, isRegistrationOpen } from '@/lib/events-catalog';
import { eventCapacityLabel } from '@/lib/event-capacity-label';
import { countRegistrationsForEvent } from '@/lib/ledger';
import type { Lang } from '@/types';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const title = {
    'zh-hk': '活動 | BNC 籃球聯賽',
    'zh-cn': '活动 | BNC 篮球联赛',
    en: 'Events | BNC Basketball League',
  };
  const description = {
    'zh-hk': SECTION_COPY['zh-hk'].eventsBanner,
    'zh-cn': SECTION_COPY['zh-cn'].eventsBanner,
    en: SECTION_COPY.en.eventsBanner,
  };
  return generatePageMetadata(params.lang, getConfig(), { title, description }, '/events');
}

export default async function EventsPage({ params }: { params: { lang: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];
  const registrationCounts = await Promise.all(
    LEAGUE_EVENTS.map((event) => countRegistrationsForEvent(event.slug))
  );

  return (
    <div className="bg-light-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-primary mb-4">{copy.events}</h1>
        <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-900 mb-8">{copy.eventsBanner}</p>
        <div className="space-y-4">
          {LEAGUE_EVENTS.map((event, index) => (
            <Link key={event.slug} href={`/${lang}/events/${event.slug}`} className="card block hover:border-orange">
              {!event.published && <p className="text-xs uppercase tracking-widest text-orange">Sample</p>}
              <h2 className="font-heading text-xl font-bold text-primary mt-1">{event.title[lang]}</h2>
              <p className="text-sm text-gray-600 mt-2">{event.summary[lang]}</p>
              <p className="text-sm mt-3 text-primary">{event.startsAt.slice(0, 16).replace('T', ' ')} · {event.location[lang]}</p>
              <p className="text-sm mt-1 text-gray-600">
                {isRegistrationOpen(event) ? `${copy.registerBy}：${event.registerBy.slice(0, 16).replace('T', ' ')}` : copy.registrationClosed}
              </p>
              {(() => {
                const capacityLabel = eventCapacityLabel(event, registrationCounts[index], lang);
                return capacityLabel ? <p className="text-sm mt-1 text-gray-600">{capacityLabel}</p> : null;
              })()}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
