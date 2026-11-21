'use client';

import OAuthSignInButtons from '@/components/OAuthSignInButtons';
import type { Lang } from '@/types';

export default function SignInGate({
  lang,
  callbackPath,
  prompt,
}: {
  lang: Lang;
  callbackPath: string;
  prompt: string;
}) {
  return (
    <div className="max-w-md mx-auto rounded-xl border border-gray-200 bg-white p-6 space-y-4">
      <p className="text-gray-700">{prompt}</p>
      <OAuthSignInButtons lang={lang} callbackUrl={callbackPath} layout="stack" theme="surface" />
    </div>
  );
}