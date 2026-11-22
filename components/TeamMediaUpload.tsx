'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import type { Lang } from '@/types';

const UI: Record<Lang, { logo: string; photo: string; busy: string; fail: string }> = {
  'zh-hk': {
    logo: '上載隊徽',
    photo: '上載相片',
    busy: '上載中…',
    fail: '上載失敗（本機可能未設定 Blob token）。',
  },
  'zh-cn': {
    logo: '上传队徽',
    photo: '上传相片',
    busy: '上传中…',
    fail: '上传失败（本机可能未设定 Blob token）。',
  },
  en: {
    logo: 'Upload logo',
    photo: 'Upload photo',
    busy: 'Uploading…',
    fail: 'Upload failed (Blob token may be missing locally).',
  },
};

export function TeamLogoUpload({
  teamId,
  lang,
  logoUrl,
  editable,
  onUpdated,
}: {
  teamId: string;
  lang: Lang;
  logoUrl: string | null;
  editable: boolean;
  onUpdated: () => void;
}) {
  const t = UI[lang];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  if (!editable) {
    return logoUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="" className="h-16 w-16 object-contain rounded border" />
    ) : null;
  }

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const pathname = `bnc/teams/${teamId}/logo-${Date.now()}`;
      await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: `/api/account/teams/${teamId}/upload`,
        clientPayload: JSON.stringify({ kind: 'logo' }),
      });
      onUpdated();
    } catch {
      setErr(t.fail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-16 w-16 object-contain rounded border" />
      ) : null}
      <label className="min-h-11 inline-flex items-center px-4 rounded-lg border cursor-pointer text-base">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => void onPick(e.target.files?.[0])}
        />
        {busy ? t.busy : t.logo}
      </label>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
    </div>
  );
}

export function PlayerPhotoUpload({
  teamId,
  membershipId,
  lang,
  photoUrl,
  editable,
  onUpdated,
}: {
  teamId: string;
  membershipId: string;
  lang: Lang;
  photoUrl: string | null;
  editable: boolean;
  onUpdated: () => void;
}) {
  const t = UI[lang];
  const [busy, setBusy] = useState(false);

  if (!editable && !photoUrl) return null;

  async function onPick(file: File | undefined) {
    if (!file || !editable) return;
    setBusy(true);
    try {
      const pathname = `bnc/teams/${teamId}/players/${membershipId}-${Date.now()}`;
      await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: `/api/account/teams/${teamId}/upload`,
        clientPayload: JSON.stringify({ kind: 'photo', membershipId }),
      });
      onUpdated();
    } catch {
      /* silent — leader can retry */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-12 w-12 object-cover rounded border" />
      ) : null}
      {editable ? (
        <label className="text-sm text-orange cursor-pointer min-h-11 inline-flex items-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void onPick(e.target.files?.[0])}
          />
          {busy ? t.busy : t.photo}
        </label>
      ) : null}
    </div>
  );
}