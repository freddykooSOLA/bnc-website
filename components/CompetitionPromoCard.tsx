import Link from 'next/link';
import type { Lang } from '@/types';
import type { Competition } from '@/lib/competitions';
import { competitionDetailPath } from '@/lib/competitions';

const COPY: Record<Lang, { cta: string }> = {
  'zh-hk': { cta: '查看章程與報名' },
  'zh-cn': { cta: '查看章程与报名' },
  en: { cta: 'Rules & registration' },
};

export default function CompetitionPromoCard({
  lang,
  competition,
}: {
  lang: Lang;
  competition: Competition;
}) {
  const copy = COPY[lang];
  return (
    <Link
      href={competitionDetailPath(competition.slug, lang)}
      className="card block hover:border-orange transition-colors border-orange/30"
    >
      <p className="text-xs uppercase tracking-widest text-orange font-medium">
        {competition.shortTitle[lang]}
      </p>
      <h2 className="font-heading text-xl font-bold text-primary mt-1">
        {competition.title[lang]}
      </h2>
      <p className="text-sm text-gray-600 mt-2">
        {competition.dateRange[lang]} · {competition.schedule[lang]}
      </p>
      <p className="text-sm text-primary mt-3">{copy.cta} →</p>
    </Link>
  );
}