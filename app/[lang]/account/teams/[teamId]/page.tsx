import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import SignInGate from '@/components/SignInGate';
import TeamRosterManager from '@/components/TeamRosterManager';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { databaseEnabled } from '@/lib/prisma';
import { assertLeaderOwnsTeam } from '@/lib/team-roster';
import type { Lang } from '@/types';

const TITLE: Record<Lang, string> = {
  'zh-hk': '管理球隊名單',
  'zh-cn': '管理球队名单',
  en: 'Manage team roster',
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string; teamId: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const title = { 'zh-hk': TITLE['zh-hk'], 'zh-cn': TITLE['zh-cn'], en: TITLE.en };
  return generatePageMetadata(params.lang, getConfig(), { title, description: title }, '/account');
}

export default async function TeamRosterPage({
  params,
}: {
  params: { lang: string; teamId: string };
}) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SignInGate lang={lang} callbackPath={`/${lang}/account/teams/${params.teamId}`} />
      </div>
    );
  }

  if (!databaseEnabled()) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-base text-gray-600">
        Database unavailable.
      </div>
    );
  }

  try {
    await assertLeaderOwnsTeam(params.teamId, session.user.id);
  } catch {
    notFound();
  }

  return (
    <div className="bg-light-bg min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <Link href={`/${lang}/account`} className="text-sm text-orange hover:underline">
          ←
        </Link>
        <h1 className="font-heading text-3xl font-bold text-primary">{TITLE[lang]}</h1>
        <TeamRosterManager teamId={params.teamId} lang={lang} />
      </div>
    </div>
  );
}