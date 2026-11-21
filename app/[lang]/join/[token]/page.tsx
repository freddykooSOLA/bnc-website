'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { Lang } from '@/types';

const COPY: Record<
  Lang,
  {
    title: string;
    signIn: string;
    confirm: string;
    confirming: string;
    success: string;
    invalid: string;
    taken: string;
    preview: string;
    team: string;
    name: string;
    account: string;
  }
> = {
  'zh-hk': {
    title: '確認球隊名單',
    signIn: '請先登入，再確認這個名單位置屬於你。',
    confirm: '確認是我',
    confirming: '處理中…',
    success: '已加入球隊。你可以在「我的帳戶」查看所有球隊。',
    invalid: '邀請連結無效或已過期。',
    taken: '這個名單位置已被另一位會員認領。',
    preview: '載入中…',
    team: '球隊',
    name: '名單姓名',
    account: '前往我的帳戶',
  },
  'zh-cn': {
    title: '确认球队名单',
    signIn: '请先登录，再确认这个名单位置属于你。',
    confirm: '确认是我',
    confirming: '处理中…',
    success: '已加入球队。你可以在「我的账户」查看所有球队。',
    invalid: '邀请链接无效或已过期。',
    taken: '这个名单位置已被另一位会员认领。',
    preview: '加载中…',
    team: '球队',
    name: '名单姓名',
    account: '前往我的账户',
  },
  en: {
    title: 'Claim roster spot',
    signIn: 'Sign in first, then confirm this roster spot is yours.',
    confirm: 'Yes, this is me',
    confirming: 'Working…',
    success: 'You joined the team. See every team under My account.',
    invalid: 'This invite link is invalid or expired.',
    taken: 'Someone else already claimed this roster spot.',
    preview: 'Loading…',
    team: 'Team',
    name: 'Roster name',
    account: 'Go to My account',
  },
};

type Preview = {
  teamName: string;
  playerName: string;
  claimable: boolean;
  reason?: string;
};

export default function JoinPage() {
  const params = useParams();
  const lang = (params?.lang as Lang) || 'zh-hk';
  const token = decodeURIComponent(String(params?.token ?? ''));
  const copy = COPY[lang] ?? COPY['zh-hk'];
  const { data: session, status } = useSession();
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/join/${encodeURIComponent(token)}/preview`);
      if (cancelled) return;
      if (res.status === 404) {
        setError(copy.invalid);
        return;
      }
      if (!res.ok) {
        setError(copy.invalid);
        return;
      }
      setPreview(await res.json());
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token, copy.invalid]);

  async function onClaim() {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/join/${encodeURIComponent(token)}`, { method: 'POST' });
    setBusy(false);
    if (res.status === 401) {
      router.push(`/api/auth/signin?callbackUrl=/${lang}/join/${encodeURIComponent(token)}`);
      return;
    }
    if (res.status === 409) {
      setError(copy.taken);
      return;
    }
    if (!res.ok) {
      setError(copy.invalid);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (status === 'loading' || !preview) {
    return (
      <JoinPageWrap lang={lang} title={copy.title}>
        <p className="text-base text-gray-600">{error || copy.preview}</p>
      </JoinPageWrap>
    );
  }

  if (!session?.user) {
    return (
      <JoinPageWrap lang={lang} title={copy.title}>
        <p className="text-base mb-4">{copy.signIn}</p>
        <Link
          href={`/api/auth/signin?callbackUrl=/${lang}/join/${encodeURIComponent(token)}`}
          className="btn-primary inline-flex min-h-11 items-center px-6 text-base"
        >
          Sign in
        </Link>
      </JoinPageWrap>
    );
  }

  if (done) {
    return (
      <JoinPageWrap lang={lang} title={copy.title}>
        <p className="text-base text-primary mb-4">{copy.success}</p>
        <Link href={`/${lang}/account`} className="text-orange text-base min-h-11 inline-flex items-center">
          {copy.account}
        </Link>
      </JoinPageWrap>
    );
  }

  if (error || (preview && !preview.claimable)) {
    return (
      <JoinPageWrap lang={lang} title={copy.title}>
        <p className="text-base text-red-700">{error || copy.invalid}</p>
      </JoinPageWrap>
    );
  }

  return (
    <JoinPageWrap lang={lang} title={copy.title}>
      <JoinPreviewCard preview={preview!} copy={copy} />
      <button
        type="button"
        onClick={onClaim}
        disabled={busy}
        className="btn-primary min-h-11 w-full sm:w-auto px-8 text-base mt-6"
      >
        {busy ? copy.confirming : copy.confirm}
      </button>
    </JoinPageWrap>
  );
}

function JoinPageWrap({
  title,
  children,
}: {
  lang: Lang;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-light-bg min-h-[50vh]">
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="font-heading text-3xl font-bold text-primary mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function JoinPreviewCard({ preview, copy }: { preview: Preview; copy: (typeof COPY)['zh-hk'] }) {
  return (
    <div className="card text-base space-y-2">
      <p>
        <span className="text-gray-500">{copy.team}：</span> {preview.teamName}
      </p>
      <p>
        <span className="text-gray-500">{copy.name}：</span> {preview.playerName}
      </p>
    </div>
  );
}