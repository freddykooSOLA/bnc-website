'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import OAuthSignInButtons from '@/components/OAuthSignInButtons';
import type { Lang } from '@/types';

const COPY: Record<
  Lang,
  {
    signOut: string;
    myRegistrations: string;
    myTeams: string;
    myAccount: string;
    loading: string;
  }
> = {
  'zh-hk': {
    signOut: '登出',
    myRegistrations: '我的報名',
    myTeams: '我的球隊',
    myAccount: '我的帳戶',
    loading: '載入中…',
  },
  'zh-cn': {
    signOut: '登出',
    myRegistrations: '我的报名',
    myTeams: '我的球队',
    myAccount: '我的账户',
    loading: '加载中…',
  },
  en: {
    signOut: 'Sign out',
    myRegistrations: 'My registrations',
    myTeams: 'My teams',
    myAccount: 'My account',
    loading: 'Loading…',
  },
};

export default function MemberAuthNav({
  lang,
  compact = false,
}: {
  lang: Lang;
  compact?: boolean;
}) {
  const { data: session, status } = useSession();
  const copy = COPY[lang];

  if (status === 'loading') {
    return (
      <span className="text-xs text-white/60 hidden sm:inline">{copy.loading}</span>
    );
  }

  if (!session?.user) {
    return (
      <OAuthSignInButtons lang={lang} callbackUrl={`/${lang}/my-registrations`} layout="row" compact={compact} />
    );
  }

  const label = session.user.name || session.user.email || '';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={`/${lang}/account`}
        className="text-xs sm:text-sm text-white/90 hover:text-white hidden md:inline"
      >
        {copy.myAccount}
      </Link>
      <Link
        href={`/${lang}/my-teams`}
        className="text-xs sm:text-sm text-white/90 hover:text-white hidden md:inline"
      >
        {copy.myTeams}
      </Link>
      <Link
        href={`/${lang}/my-registrations`}
        className="text-xs sm:text-sm text-white/90 hover:text-white hidden lg:inline max-w-[8rem] truncate"
        title={label}
      >
        {copy.myRegistrations}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: `/${lang}` })}
        className="text-xs sm:text-sm font-medium min-h-11 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white whitespace-nowrap inline-flex items-center"
      >
        {copy.signOut}
      </button>
    </div>
  );
}