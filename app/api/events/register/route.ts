import { NextResponse } from 'next/server';
import { getEvent } from '@/lib/events-catalog';
import { saveRegistration } from '@/lib/ledger';
import { clip, hasAtLeastDigits, makeRef } from '@/lib/codes';
import type { Lang } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: {
    slug?: string;
    name?: string;
    phone?: string;
    email?: string;
    team?: string;
    lang?: Lang;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const event = getEvent(String(body.slug || ''));
  if (!event) return NextResponse.json({ error: 'unknown_event' }, { status: 400 });

  const lang: Lang = body.lang === 'en' || body.lang === 'zh-cn' ? body.lang : 'zh-hk';
  const name = clip(body.name, 80);
  const phone = clip(body.phone, 40);
  const email = clip(body.email, 120);
  const team = clip(body.team, 60);

  if (name.length < 2 || !hasAtLeastDigits(phone, 6) || team.length < 2) {
    return NextResponse.json({ error: 'invalid_contact' }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  try {
    const registration = await saveRegistration({
      ref: makeRef('BNC-E'),
      eventSlug: event.slug,
      eventTitle: event.title[lang],
      name,
      phone,
      email,
      team,
      createdAt: new Date().toISOString(),
      checkedInAt: null,
    });
    return NextResponse.json({ registration });
  } catch {
    return NextResponse.json({ error: 'store_unavailable' }, { status: 503 });
  }
}
