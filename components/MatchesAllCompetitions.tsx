import Link from 'next/link';
import type { Lang, LeagueConfig } from '@/types';
import {
  COMPETITIONS,
  competitionDetailPath,
  competitionRegisterPath,
} from '@/lib/competitions';
import { isCompetitionRegistrationOpen } from '@/lib/competition-registration';

const COPY: Record<
  Lang,
  {
    heading: string;
    siteCompetitions: string;
    scorelabLeagues: string;
    open: string;
    closed: string;
    viewRules: string;
    register: string;
    viewData: string;
  }
> = {
  'zh-hk': {
    heading: '全部比賽',
    siteCompetitions: '聯賽及邀請賽',
    scorelabLeagues: 'ScoreLab 聯賽數據',
    open: '接受報名中',
    closed: '報名已截止',
    viewRules: '賽事章程',
    register: '立即報名',
    viewData: '查看積分及賽程',
  },
  'zh-cn': {
    heading: '全部比赛',
    siteCompetitions: '联赛及邀请赛',
    scorelabLeagues: 'ScoreLab 联赛数据',
    open: '接受报名中',
    closed: '报名已截止',
    viewRules: '赛事章程',
    register: '立即报名',
    viewData: '查看积分及赛程',
  },
  en: {
    heading: 'All competitions',
    siteCompetitions: 'Leagues & invitationals',
    scorelabLeagues: 'ScoreLab league stats',
    open: 'Registration open',
    closed: 'Registration closed',
    viewRules: 'Competition details',
    register: 'Register now',
    viewData: 'Standings & schedule',
  },
};

export default function MatchesAllCompetitions({
  lang,
  scorelabLeagues,
}: {
  lang: Lang;
  scorelabLeagues: LeagueConfig[];
}) {
  const t = COPY[lang];

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2"
      aria-labelledby="matches-all-heading"
    >
      <h2 id="matches-all-heading" className="font-heading text-2xl font-bold text-primary mb-6">
        {t.heading}
      </h2>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t.siteCompetitions}
      </h3>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {COMPETITIONS.map((c) => {
          const open = isCompetitionRegistrationOpen(c);
          return (
            <li key={c.slug} className="card flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-heading text-lg font-bold text-primary">{c.shortTitle[lang]}</p>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                    open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {open ? t.open : t.closed}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{c.title[lang]}</p>
              <p className="text-sm text-gray-500">{c.dateRange[lang]}</p>
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                <Link
                  href={competitionDetailPath(c.slug, lang)}
                  className="min-h-11 inline-flex items-center px-4 text-base rounded-lg border border-gray-200 hover:border-orange text-primary"
                >
                  {t.viewRules}
                </Link>
                {open ? (
                  <Link
                    href={competitionRegisterPath(c.slug, lang)}
                    className="min-h-11 inline-flex items-center px-4 text-base rounded-lg bg-orange text-white hover:opacity-90"
                  >
                    {t.register}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {t.scorelabLeagues}
      </h3>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scorelabLeagues.map((league) => (
          <li key={league.id}>
            <Link
              href={`/${lang}/matches?season=${encodeURIComponent(league.id)}`}
              className="card block hover:border-orange transition-colors min-h-11"
            >
              <p className="font-heading text-lg font-bold text-primary">
                {league.league} — {league.season}
              </p>
              <p className="text-sm text-orange mt-2">{t.viewData} →</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}