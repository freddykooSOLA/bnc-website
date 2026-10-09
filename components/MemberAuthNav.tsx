'use client';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import type { Lang } from '@/types';

const COPY: Record<
  Lang,
  { signIn: string; signOut: string; myRegistrations: string; loading: string }
> = {
  'zh-hk': {
    signIn: '使用 Google 登入',
    signOut: '登出',
    myRegistrations: '我的報名',
    loading: '載入中…',
  },
  'zh-cn': {
    signIn: '使用 Google 登录',
    signOut: '登出',
    myRegistrations: '我的报名',
    loading: '加载中…',
  },
  en: {
    signIn: 'Sign in with Google',
    signOut: 'Sign out',
    myRegistrations: 'My registrations',
    loading: 'Loading…',
  },
};

export default function MemberAuthNav({ lang }: { lang: Lang }) {
  const { data: session, status } = useSession();
  const copy = COPY[lang];

  if (status === 'loading') {
    return (
      <span className="text-xs text-white/60 hidden sm:inline">{copy.loading}</span>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: `/${lang}/my-registrations` })}
        className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white whitespace-nowrap"
      >
        {copy.signIn}
      </button>
    );
  }

  const label = session.user.name || session.user.email || '';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link
        href={`/${lang}/my-registrations`}
        className="text-xs sm:text-sm text-white/90 hover:text-white hidden sm:inline max-w-[8rem] truncate"
        title={label}
      >
        {copy.myRegistrations}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: `/${lang}` })}
        className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white whitespace-nowrap"
      >
        {copy.signOut}
      </button>
    </div>
  );
}
