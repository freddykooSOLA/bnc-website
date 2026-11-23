import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import SignInGate from '@/components/SignInGate';
import { getConfig } from '@/lib/config';
import { isValidLang } from '@/lib/i18n';
import { generatePageMetadata } from '@/lib/seo';
import { loadMemberAccount, ROLE_LABEL } from '@/lib/member-account';
import PlayerLinkSection from '@/components/PlayerLinkSection';
import { databaseEnabled, prisma } from '@/lib/prisma';
import type { Lang } from '@/types';
import type { MemberRoleType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const COPY: Record<
  Lang,
  {
    title: string;
    signIn: string;
    roles: string;
    myTeamsLeader: string;
    myTeamsPlayer: string;
    myEntries: string;
    followedTeams: string;
    noDb: string;
    status: string;
    noRoles: string;
    defaultFan: string;
    manageRoster: string;
    entryNextSteps: string;
  }
> = {
  'zh-hk': {
    title: '我的帳戶',
    signIn: '請先登入以查看帳戶資料。',
    roles: '身份',
    myTeamsLeader: '我帶領的球隊',
    myTeamsPlayer: '我效力的球隊',
    myEntries: '我的報名',
    followedTeams: '我關注的球隊',
    noDb: '資料庫未啟用時，僅顯示登入資料與已關注球隊。',
    status: '狀態',
    noRoles: '尚未設定額外身份',
    defaultFan: '粉絲（預設）',
    manageRoster: '管理名單',
    entryNextSteps:
      '繳費後待大會確認。確認後請於「我帶領的球隊」上載球員名單（可匯入 Excel）。',
  },
  'zh-cn': {
    title: '我的账户',
    signIn: '请先登录以查看账户资料。',
    roles: '身份',
    myTeamsLeader: '我带领的球队',
    myTeamsPlayer: '我效力的球队',
    myEntries: '我的报名',
    followedTeams: '我关注的球队',
    noDb: '数据库未启用时，仅显示登录资料与已关注球队。',
    status: '状态',
    noRoles: '尚未设定额外身份',
    defaultFan: '粉丝（默认）',
    manageRoster: '管理名单',
    entryNextSteps: 'After payment, wait for confirmation. Then upload your roster under Teams I manage (Excel import supported).',
  },
  en: {
    title: 'My account',
    signIn: 'Sign in to view your account.',
    roles: 'Roles',
    myTeamsLeader: 'Teams I manage',
    myTeamsPlayer: 'Teams I play for',
    myEntries: 'My entries',
    followedTeams: 'Teams I follow',
    noDb: 'Without a database, only your sign-in and followed teams are shown.',
    status: 'Status',
    noRoles: 'No extra roles yet',
    defaultFan: 'Fan (default)',
    manageRoster: 'Manage roster',
    entryNextSteps:
      'After payment, wait for confirmation. Then upload your roster under Teams I manage (Excel import supported).',
  },
};

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  if (!isValidLang(params.lang)) return {};
  const title = {
    'zh-hk': COPY['zh-hk'].title,
    'zh-cn': COPY['zh-cn'].title,
    en: COPY.en.title,
  };
  return generatePageMetadata(
    params.lang,
    getConfig(),
    {
      title,
      description: title,
    },
    '/account'
  );
}

export default async function AccountPage({ params }: { params: { lang: string } }) {
  if (!isValidLang(params.lang)) notFound();
  const lang = params.lang as Lang;
  const copy = COPY[lang];
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-primary mb-6">{copy.title}</h1>
        <SignInGate lang={lang} callbackPath={`/${lang}/account`} prompt={copy.signIn} />
      </div>
    );
  }

  const account = databaseEnabled() ? await loadMemberAccount(session.user.id) : null;

  const follows =
    databaseEnabled()
      ? await prisma.teamFollow.findMany({
          where: { memberId: session.user.id },
          orderBy: { createdAt: 'desc' },
        })
      : [];

  const roleTags: MemberRoleType[] =
    account && account.roles.length > 0 ? account.roles : [];

  return (
    <div className="bg-light-bg min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <h1 className="font-heading text-3xl font-bold text-primary">{copy.title}</h1>
        <p className="text-sm text-gray-600">
          {session.user.name || session.user.email}
        </p>

        <section className="card space-y-2">
          <h2 className="font-heading text-lg font-bold text-primary">{copy.roles}</h2>
          <RoleTags lang={lang} roles={roleTags} copy={copy} />
        </section>

        {!account ? <p className="text-sm text-gray-500">{copy.noDb}</p> : null}

        {account && account.leaderTeams.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-primary">{copy.myTeamsLeader}</h2>
            {account.leaderTeams.map((team) => (
              <TeamCard key={team.teamId} team={team} lang={lang} copy={copy} showManage />
            ))}
          </section>
        ) : null}

        {account && account.playerTeams.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-primary">{copy.myTeamsPlayer}</h2>
            {account.playerTeams.map((team) => (
              <TeamCard key={`player-${team.teamId}`} team={team} lang={lang} copy={copy} />
            ))}
          </section>
        ) : null}

        {account && account.entries.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-primary">{copy.myEntries}</h2>
            <p className="text-sm text-gray-600">{copy.entryNextSteps}</p>
            <ul className="card text-sm space-y-2">
              {account.entries.map((entry) => (
                <li key={entry.ref}>
                  <Link
                    href={`/${lang}/competitions/${entry.slug}`}
                    className="text-orange hover:underline"
                  >
                    {entry.competitionTitle}
                  </Link>
                  <span className="text-gray-500"> · {entry.ref} · {copy.status} {entry.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {databaseEnabled() ? <PlayerLinkSection lang={lang} /> : null}

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-primary">{copy.followedTeams}</h2>
          {follows.length === 0 ? (
            <Link href={`/${lang}/my-teams`} className="text-sm text-orange">
              {copy.followedTeams}
            </Link>
          ) : (
            <ul className="card text-sm space-y-2">
              {follows.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/${lang}/teams/${f.leagueId}/${f.teamId}`}
                    className="text-orange hover:underline"
                  >
                    {f.teamName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function RoleTags({
  lang,
  roles,
  copy,
}: {
  lang: Lang;
  roles: MemberRoleType[];
  copy: (typeof COPY)['zh-hk'];
}) {
  const tags =
    roles.length > 0
      ? roles.map((role) => ROLE_LABEL[role][lang])
      : [copy.defaultFan];
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((label) => (
        <span
          key={label}
          className="text-xs font-medium px-2 py-1 rounded-full bg-orange/10 text-orange"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function TeamCard({
  team,
  lang,
  copy,
  showManage,
}: {
  team: {
    teamId: string;
    teamName: string;
    bank: string;
    logoUrl?: string | null;
    entryRef?: string;
    entryStatus?: string;
    competitionSlug?: string;
    competitionTitle?: string;
  };
  lang: Lang;
  copy: (typeof COPY)['zh-hk'];
  showManage?: boolean;
}) {
  return (
    <div className="card text-sm space-y-1 flex gap-3">
      {team.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.logoUrl} alt="" className="h-12 w-12 object-contain rounded border shrink-0" />
      ) : null}
      <div className="space-y-1">
      <p className="font-medium text-primary">{team.teamName}</p>
      <p className="text-gray-600">{team.bank}</p>
      {team.competitionTitle && team.competitionSlug ? (
        <p>
          <Link href={`/${lang}/competitions/${team.competitionSlug}`} className="text-orange hover:underline">
            {team.competitionTitle}
          </Link>
        </p>
      ) : null}
      {team.entryRef ? (
        <p className="text-gray-500">
          {team.entryRef} · {copy.status} {team.entryStatus}
        </p>
      ) : null}
      {showManage ? (
        <Link
          href={`/${lang}/account/teams/${team.teamId}`}
          className="inline-flex items-center min-h-11 text-base text-orange hover:underline"
        >
          {copy.manageRoster}
        </Link>
      ) : null}
      </div>
    </div>
  );
}