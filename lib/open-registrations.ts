import type { Lang } from '@/types';
import {
  COMPETITIONS,
  competitionRegisterPath,
  type Competition,
} from '@/lib/competitions';
import { isCompetitionRegistrationOpen } from '@/lib/competition-registration';
import {
  LEAGUE_EVENTS,
  isRegistrationOpen,
  type LeagueEvent,
} from '@/lib/events-catalog';
import { listPublicEvents } from '@/lib/public-catalog';

export type OpenRegistrationItem =
  | {
      kind: 'competition';
      slug: string;
      title: string;
      dateLabel: string;
      registerByLabel: string;
      href: string;
    }
  | {
      kind: 'event';
      slug: string;
      title: string;
      dateLabel: string;
      registerByLabel: string;
      href: string;
    };

export function listOpenRegistrations(lang: Lang): OpenRegistrationItem[] {
  const items: OpenRegistrationItem[] = [];

  for (const c of COMPETITIONS) {
    if (!isCompetitionRegistrationOpen(c)) continue;
    items.push(competitionItem(c, lang));
  }

  const publicSlugs = new Set(listPublicEvents().map((e) => e.slug));
  for (const event of LEAGUE_EVENTS) {
    if (event.published !== true && !publicSlugs.has(event.slug)) continue;
    if (!isRegistrationOpen(event)) continue;
    items.push(eventItem(event, lang));
  }

  return items;
}

function competitionItem(c: Competition, lang: Lang): OpenRegistrationItem {
  return {
    kind: 'competition',
    slug: c.slug,
    title: c.shortTitle[lang],
    dateLabel: c.dateRange[lang],
    registerByLabel: c.registerBy,
    href: competitionRegisterPath(c.slug, lang),
  };
}

function eventItem(event: LeagueEvent, lang: Lang): OpenRegistrationItem {
  return {
    kind: 'event',
    slug: event.slug,
    title: event.title[lang],
    dateLabel: event.startsAt.slice(0, 10),
    registerByLabel: event.registerBy.slice(0, 10),
    href: `/${lang}/events/${event.slug}`,
  };
}