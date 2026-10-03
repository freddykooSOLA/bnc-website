import type { LeagueEvent } from '@/lib/events-catalog';
import { isEventFull, spotsRemaining } from '@/lib/events-catalog';
import type { Lang } from '@/types';
import { SECTION_COPY } from '@/lib/section-copy';

export function eventCapacityLabel(event: LeagueEvent, registeredCount: number, lang: Lang) {
  if (event.capacity == null) return null;
  const copy = SECTION_COPY[lang];
  if (isEventFull(event, registeredCount)) return copy.eventFull;
  const remaining = spotsRemaining(event, registeredCount);
  if (remaining == null) return null;
  return copy.spotsRemaining(remaining);
}
