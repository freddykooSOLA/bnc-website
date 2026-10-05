import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { notFound } from 'next/navigation';
import { isValidLang } from '@/lib/i18n';
import { SECTION_COPY } from '@/lib/section-copy';
import { findRegistration } from '@/lib/ledger';
import { getEvent } from '@/lib/events-catalog';
import EventPaymentInstructions from '@/components/EventPaymentInstructions';
import { isRef } from '@/lib/codes';
import type { Lang } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bncleague.com';

export default async function TicketPage({ params }: { params: { lang: string; ref: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const ref = params.ref.toUpperCase();
  if (!isRef(ref, 'BNC-E')) notFound();
  const registration = await findRegistration(ref);
  if (!registration) notFound();
  const lang: Lang = params.lang;
  const copy = SECTION_COPY[lang];
  const catalogEvent = getEvent(registration.eventSlug);
  const checkinUrl = `${BASE_URL}/admin/checkin?code=${registration.ref}`;
  const svg = await QRCode.toString(checkinUrl, { type: 'svg', margin: 1, width: 240 });

  return (
    <div className="bg-light-bg">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-primary">{copy.ticketTitle}</h1>
        <p className="mt-3 text-sm text-gray-600">{copy.ticketHint}</p>
        <div className="card mt-6 text-center">
          <p className="text-sm text-gray-500">{copy.ref}</p>
          <p className="font-mono text-xl text-orange mt-1">{registration.ref}</p>
          <div
            className="mx-auto mt-4 w-56 [&>svg]:w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <p className="mt-4 font-semibold text-primary">{registration.name} · {registration.team}</p>
          <p className="text-sm text-gray-600">{registration.eventTitle}</p>
          <p className="text-sm mt-2">{registration.checkedInAt ? copy.checkedIn : copy.notChecked}</p>
        </div>
        {catalogEvent?.collectPayment && (
          <div className="mt-6">
            <EventPaymentInstructions lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}
