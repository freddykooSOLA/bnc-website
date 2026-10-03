import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { getEvent, isEventFull, isRegistrationOpen } from '@/lib/events-catalog';
import { eventCapacityLabel } from '@/lib/event-capacity-label';
import { countRegistrationsForEvent } from '@/lib/ledger';
import { SECTION_COPY } from '@/lib/section-copy';
import type { Lang } from '@/types';
import EventRegisterForm from '@/components/EventRegisterForm';

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const event = getEvent(params.slug);
  if (!event) return {};
  return generatePageMetadata(params.lang, getConfig(), {
    title: event.title,
    description: event.summary,
  }, `/events/${event.slug}`);
}

export default async function EventDetailPage({ params }: { params: { lang: string; slug: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const event = getEvent(params.slug);
  if (!event) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];
  const registeredCount = await countRegistrationsForEvent(event.slug);
  const capacityLabel = eventCapacityLabel(event, registeredCount, lang);
  const registrationOpen = isRegistrationOpen(event) && !isEventFull(event, registeredCount);

  return (
    <div className="bg-light-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link href={`/${lang}/events`} className="text-sm text-orange">{copy.back}</Link>
        <p className="text-xs uppercase tracking-widest text-orange">Sample</p>
        <h1 className="font-heading text-3xl font-bold text-primary">{event.title[lang]}</h1>
        <p className="text-gray-600">{event.summary[lang]}</p>
        <div className="card text-sm space-y-1">
          <p>{event.startsAt.slice(0, 16).replace('T', ' ')}</p>
          <p>{event.location[lang]}</p>
          <p>{event.feeNote[lang]}</p>
          <p>{copy.registerBy}：{event.registerBy.slice(0, 16).replace('T', ' ')}</p>
          {capacityLabel && <p>{capacityLabel}</p>}
        </div>
        {registrationOpen ? (
          <EventRegisterForm lang={lang} slug={event.slug} />
        ) : (
          <p className="card text-sm text-red-600">
            {!isRegistrationOpen(event) ? copy.registrationClosed : copy.eventFull}
          </p>
        )}
      </div>
    </div>
  );
}
