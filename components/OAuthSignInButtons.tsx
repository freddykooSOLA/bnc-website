'use client';

import { signIn } from 'next-auth/react';
import { facebookLoginVisibleOnClient } from '@/lib/oauth-providers';
import type { Lang } from '@/types';

const COPY: Record<Lang, { google: string; facebook: string }> = {
  'zh-hk': { google: '用 Google 登入', facebook: '用 Facebook 登入' },
  'zh-cn': { google: '用 Google 登录', facebook: '用 Facebook 登录' },
  en: { google: 'Sign in with Google', facebook: 'Sign in with Facebook' },
};

const BASE_BTN =
  'min-h-11 text-sm font-medium px-4 rounded-lg inline-flex items-center justify-center whitespace-nowrap';

const THEMES = {
  header: {
    google: `${BASE_BTN} bg-white/15 hover:bg-white/25 text-white`,
    facebook: `${BASE_BTN} bg-[#1877F2]/90 hover:bg-[#1877F2] text-white`,
  },
  surface: {
    google: `${BASE_BTN} w-full border border-gray-300 bg-white hover:bg-gray-50 text-primary shadow-sm`,
    facebook: `${BASE_BTN} w-full bg-[#1877F2] hover:bg-[#166FE5] text-white`,
  },
} as const;

export default function OAuthSignInButtons({
  lang,
  callbackUrl,
  layout = 'row',
  theme = 'header',
}: {
  lang: Lang;
  callbackUrl: string;
  layout?: 'row' | 'stack';
  theme?: 'header' | 'surface';
}) {
  const copy = COPY[lang];
  const showFacebook = facebookLoginVisibleOnClient();
  const styles = THEMES[theme];
  const container =
    layout === 'stack'
      ? 'flex flex-col gap-3 w-full'
      : 'flex flex-wrap gap-2 items-center';

  const rowOnSurface = layout === 'row' && theme === 'surface' ? 'w-auto' : '';

  return (
    <div className={container}>
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl })}
        className={`${styles.google} ${rowOnSurface}`}
      >
        {copy.google}
      </button>
      {showFacebook ? (
        <button
          type="button"
          onClick={() => signIn('facebook', { callbackUrl })}
          className={`${styles.facebook} ${rowOnSurface}`}
        >
          {copy.facebook}
        </button>
      ) : null}
    </div>
  );
}