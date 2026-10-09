import { notFound } from 'next/navigation';
import { auth, signIn } from '@/auth';
import { isValidLang } from '@/lib/i18n';
import { findMemberById } from '@/lib/users';
import type { Lang } from '@/types';

const COPY: Record<
  Lang,
  {
    title: string;
    signedInAs: string;
    skeleton: string;
    signInPrompt: string;
  }
> = {
  'zh-hk': {
    title: '我的報名',
    signedInAs: '已登入為',
    skeleton: 'M1：此頁將顯示與您帳號關聯的報名紀錄（尚未與 ledger 關聯）。',
    signInPrompt: '請先登入以查看個人報名。',
  },
  'zh-cn': {
    title: '我的报名',
    signedInAs: '已登录为',
    skeleton: 'M1：此页将显示与您账号关联的报名记录（尚未与 ledger 关联）。',
    signInPrompt: '请先登录以查看个人报名。',
  },
  en: {
    title: 'My registrations',
    signedInAs: 'Signed in as',
    skeleton:
      'M1: Registrations linked to your account will appear here (ledger linking comes in a later phase).',
    signInPrompt: 'Please sign in to view your registrations.',
  },
};

interface PageProps {
  params: { lang: string };
}

export default async function MyRegistrationsPage({ params }: PageProps) {
  const { lang: langParam } = params;
  if (!isValidLang(langParam)) notFound();
  const lang = langParam as Lang;
  const copy = COPY[lang];

  const session = await auth();
  if (!session?.user) {
    await signIn('google', { redirectTo: `/${lang}/my-registrations` });
    return null;
  }

  const memberId = session.user.id;
  const member = memberId ? await findMemberById(memberId) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary mb-4">
        {copy.title}
      </h1>
      <p className="text-gray-700 mb-2">
        {copy.signedInAs}{' '}
        <span className="font-medium">
          {session.user.name || session.user.email}
        </span>
      </p>
      {member && (
        <p className="text-sm text-gray-500 mb-6">
          {member.email} · member since {new Date(member.createdAt).toLocaleDateString()}
        </p>
      )}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
        {copy.skeleton}
      </div>
    </div>
  );
}
