'use client';

import { signIn } from 'next-auth/react';
import { facebookLoginVisibleOnClient } from '@/lib/oauth-providers';
import type { Lang } from '@/types';

const COPY: Record<Lang, { google: string; facebook: string }> = {
  'zh-hk': { google: '用 Google 登入', facebook: '用 Facebook 登入' },
  'zh-cn': { google: '用 Google 登录', facebook: '用 Facebook 登录' },
  en: { google: 'Sign in with Google', facebook: 'Sign in with Facebook' },
};

export default function OAuthSignInButtons({
  lang,
  callbackUrl,
  layout = 'row',
}: {
  lang: Lang;
  callbackUrl: string;
  layout?: 'row' | 'stack';
}) {
  const copy = COPY[lang];
  const showFacebook = facebookLoginVisibleOnClient();
  const container =
    layout === 'stack' ? 'flex flex-col gap-2 w-full' : 'flex flex-wrap gap-2';

  return (
    <div className={container}>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl })}
        className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white whitespace-nowrap"
      >
        {copy.google}
      </button>
      {showFacebook ? (
        <button
          type="button"
          onClick={() => signIn('facebook', { callbackUrl })}
          className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-[#1877F2]/90 hover:bg-[#1877F2] text-white whitespace-nowrap"
        >
          {copy.facebook}
        </button>
      ) : null}
    </div>
  );
}