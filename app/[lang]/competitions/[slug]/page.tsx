import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import {
  COMPETITION_UI,
  competitionRegisterPath,
  getCompetition,
} from '@/lib/competitions';
import type { Lang } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const competition = getCompetition(params.slug);
  if (!competition) return {};
  return generatePageMetadata(
    params.lang,
    getConfig(),
    {
      title: competition.title,
      description: competition.shortTitle,
    },
    `/competitions/${competition.slug}`
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-3">
      <h2 className="font-heading text-lg font-bold text-primary">{title}</h2>
      {children}
    </section>
  );
}

export default function CompetitionPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  if (!isValidLang(params.lang)) notFound();
  const competition = getCompetition(params.slug);
  if (!competition) notFound();
  const lang = params.lang as Lang;
  const ui = COMPETITION_UI[lang];

  return (
    <div className="bg-light-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link href={`/${lang}/events`} className="text-sm text-orange">
          {ui.back}
        </Link>
        <header className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-primary">
            {competition.title[lang]}
          </h1>
          <p className="text-xs text-gray-500">{competition.dateDisclaimer[lang]}</p>
        </header>

        <div className="card text-sm space-y-2">
          <p>
            <span className="font-medium text-primary">{competition.category[lang]}</span>
          </p>
          <p>{competition.dateRange[lang]}</p>
          <p>{competition.schedule[lang]}</p>
          <p>{competition.venue[lang]}</p>
          <p>
            {ui.registerBy}：{competition.registerBy}
          </p>
          <p>
            {ui.rosterBy}：{competition.rosterBy}
          </p>
        </div>

        <Section title={ui.sectionPrizes}>
          <p className="text-sm text-gray-700 whitespace-pre-line">{competition.prizes[lang]}</p>
        </Section>

        <Section title={ui.sectionIndividual}>
          <p className="text-sm text-gray-700">{competition.individualAwards[lang]}</p>
        </Section>

        <Section title={ui.sectionEntry}>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            {competition.howToEnter.map((item) => (
              <li key={item[lang].slice(0, 32)}>{item[lang]}</li>
            ))}
          </ul>
          <p className="text-sm font-medium text-primary">{competition.fee[lang]}</p>
          <p className="text-sm text-gray-700">{competition.chequePayee[lang]}</p>
        </Section>

        <Section title={ui.sectionFormat}>
          <p className="text-sm text-gray-700">{competition.format[lang]}</p>
          <p className="text-sm text-gray-700">{competition.tieBreak[lang]}</p>
        </Section>

        <Section title={ui.sectionAdvancement}>
          <p className="text-sm text-gray-700">{competition.advancement[lang]}</p>
        </Section>

        <Section title={ui.sectionNotices}>
          <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-2">
            {competition.notices.map((item) => (
              <li key={item[lang].slice(0, 32)}>{item[lang]}</li>
            ))}
          </ol>
        </Section>

        <Section title={ui.sectionContact}>
          <p className="text-sm text-gray-700">
            {ui.phone}：{competition.contactPhone}
          </p>
          <p className="text-sm text-gray-700">
            {ui.email}：
            <a href={`mailto:${competition.contactEmail}`} className="text-orange hover:underline">
              {competition.contactEmail}
            </a>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {competition.organizer[lang]} · {competition.organizerDate}
          </p>
        </Section>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={competition.downloadPath}
            className="btn-primary text-center text-sm"
            download
          >
            {ui.downloadForm}
          </a>
          <Link
            href={competitionRegisterPath(competition.slug, lang)}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-orange text-orange hover:bg-orange/5 text-center"
          >
            {ui.registerOnline}
          </Link>
        </div>
      </div>
    </div>
  );
}