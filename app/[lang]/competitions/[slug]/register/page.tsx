import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import SignInGate from '@/components/SignInGate';
import TeamEntryRegisterForm from '@/components/TeamEntryRegisterForm';
import { getConfig } from '@/lib/config';
import { competitionEntriesEnabled } from '@/lib/competition-db';
import { COMPETITION_UI, getCompetition } from '@/lib/competitions';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import type { Lang } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const competition = getCompetition(params.slug);
  if (!competition) return {};
  const title = {
    'zh-hk': `球隊報名 — ${competition.shortTitle['zh-hk']}`,
    'zh-cn': `球队报名 — ${competition.shortTitle['zh-cn']}`,
    en: `Team entry — ${competition.shortTitle.en}`,
  };
  return generatePageMetadata(
    params.lang,
    getConfig(),
    {
      title,
      description: competition.title,
    },
    `/competitions/${competition.slug}/register`
  );
}

const SIGN_IN: Record<Lang, string> = {
  'zh-hk': '請先登入以提交球隊報名。',
  'zh-cn': '请先登录以提交球队报名。',
  en: 'Please sign in to submit a team entry.',
};

export default async function CompetitionRegisterPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  if (!isValidLang(params.lang)) notFound();
  const competition = getCompetition(params.slug);
  if (!competition) notFound();
  const lang = params.lang as Lang;
  const ui = COMPETITION_UI[lang];
  const session = await auth();
  const offline = !competitionEntriesEnabled();

  return (
    <div className="bg-light-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link
          href={`/${lang}/competitions/${competition.slug}`}
          className="text-sm text-orange"
        >
          {ui.back}
        </Link>
        <h1 className="font-heading text-2xl font-bold text-primary">
          {competition.title[lang]}
        </h1>
        <p className="text-sm text-gray-600">{ui.registerOnline}</p>

        {!session?.user ? (
          <SignInGate
            lang={lang}
            callbackPath={`/${lang}/competitions/${competition.slug}/register`}
            prompt={SIGN_IN[lang]}
          />
        ) : (
          <TeamEntryRegisterForm
            lang={lang}
            slug={competition.slug}
            competition={competition}
            offline={offline}
          />
        )}
      </div>
    </div>
  );
}