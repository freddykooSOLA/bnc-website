'use client';

import { useCallback, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import type { Lang } from '@/types';
import { UI_TEXT } from '@/lib/i18n';

interface FollowTeamButtonProps {
  lang: Lang;
  leagueId: string;
  teamId: string;
  teamName: string;
}

type FollowRow = { leagueId: string; teamId: string; teamName: string };

export default function FollowTeamButton({
  lang,
  leagueId,
  teamId,
  teamName,
}: FollowTeamButtonProps) {
  const t = UI_TEXT[lang];
  const { data: session, status } = useSession();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/follows', { credentials: 'same-origin' });
      if (res.status === 503) {
        setAvailable(false);
        return;
      }
      if (!res.ok) {
        setAvailable(false);
        return;
      }
      setAvailable(true);
      const data = (await res.json()) as { follows?: FollowRow[] };
      const list = data.follows ?? [];
      setFollowing(
        list.some((f) => f.leagueId === leagueId && f.teamId === teamId)
      );
    } catch {
      setAvailable(false);
    }
  }, [leagueId, teamId]);

  useEffect(() => {
    if (status === 'authenticated') {
      load();
    } else if (status === 'unauthenticated') {
      fetch('/api/follows', { credentials: 'same-origin' })
        .then((res) => {
          if (res.status === 503) setAvailable(false);
          else setAvailable(true);
        })
        .catch(() => setAvailable(false));
    }
  }, [status, load]);

  if (available === false) return null;

  if (status === 'loading' || available === null) {
    return (
      <span className="text-sm text-gray-400">{t.loading}</span>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() =>
          signIn('google', {
            callbackUrl: `/${lang}/teams/${leagueId}/${teamId}`,
          })
        }
        className="btn-secondary text-sm"
      >
        {t.signInToFollow}
      </button>
    );
  }

  const toggle = async () => {
    setBusy(true);
    try {
      if (following) {
        const res = await fetch(
          `/api/follows?leagueId=${encodeURIComponent(leagueId)}&teamId=${encodeURIComponent(teamId)}`,
          { method: 'DELETE', credentials: 'same-origin' }
        );
        if (res.ok) setFollowing(false);
      } else {
        const res = await fetch('/api/follows', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leagueId, teamId, teamName }),
        });
        if (res.ok) setFollowing(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={toggle}
      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
        following
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-orange text-white hover:bg-orange/90'
      }`}
    >
      {following ? t.unfollowTeam : t.followTeam}
    </button>
  );
}
