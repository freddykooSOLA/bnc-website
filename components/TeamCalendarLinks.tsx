import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface TeamCalendarLinksProps {
  lang: Lang;
  leagueId: string;
  teamId: string;
}

export default function TeamCalendarLinks({
  lang,
  leagueId,
  teamId,
}: TeamCalendarLinksProps) {
  const t = UI_TEXT[lang];
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'https://bncleague.com';
  // Vercel 上帶 `.ics` 後綴的動態段解析與本機不一致；路由仍回 text/calendar
  const httpsUrl = `${base}/api/calendar/${leagueId}/${teamId}`;
  const webcalUrl = httpsUrl.replace(/^https:/, 'webcal:');

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      <span className="text-sm text-gray-600 w-full sm:w-auto">{t.addToCalendar}:</span>
      <a
        href={webcalUrl}
        className="text-sm text-primary hover:text-orange underline"
      >
        {t.calendarSubscribe}
      </a>
      <a
        href={httpsUrl}
        download
        className="text-sm text-primary hover:text-orange underline"
      >
        {t.calendarDownload}
      </a>
    </div>
  );
}
