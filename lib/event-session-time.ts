/** Display end time for meetup sessions (19:00–21:00). */
export function eventSessionEndLabel(startsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (date: Date) =>
    date.toLocaleString('sv-SE', { timeZone: 'Asia/Hong_Kong' }).slice(0, 16).replace('T', ' ');
  return `${fmt(start)} – ${fmt(end).slice(11)}`;
}
