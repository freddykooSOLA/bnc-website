'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Lang } from '@/types';

interface RosterPlayer {
  id: string;
  nameZh: string;
  nameEn: string;
  idPartial: string;
  staffId: string;
  jerseyNumber: number;
  status: string;
  hasInvite: boolean;
  memberJoined: boolean;
}

interface RosterData {
  team: { id: string; name: string; bank: string };
  entry: { ref: string; status: string; competitionTitle: string } | null;
  rosterBy: string | null;
  editable: boolean;
  players: RosterPlayer[];
}

const UI: Record<Lang, Record<string, string>> = {
  'zh-hk': {
    status: '報名狀態',
    rosterDeadline: '名單截止',
    locked: '名單已截止，無法修改。',
    nameZh: '中文姓名',
    nameEn: '英文姓名',
    idPartial: '身份證首四位',
    staffId: '職員證號（選填）',
    jersey: '球衣號碼',
    add: '新增球員',
    save: '儲存',
    remove: '移除',
    copyInvite: '複製邀請連結',
    copied: '已複製連結',
    joined: '已認領',
    listed: '待認領',
    countHint: '名單須保持 5–20 人。',
    loadError: '無法載入名單。',
    claimLocked: '球員已認領，不可修改。',
  },
  'zh-cn': {
    status: '报名状态',
    rosterDeadline: '名单截止',
    locked: '名单已截止，无法修改。',
    nameZh: '中文姓名',
    nameEn: '英文姓名',
    idPartial: '身份证首四位',
    staffId: '职员证号（选填）',
    jersey: '球衣号码',
    add: '新增球员',
    save: '保存',
    remove: '移除',
    copyInvite: '复制邀请链接',
    copied: '已复制链接',
    joined: '已认领',
    listed: '待认领',
    countHint: '名单须保持 5–20 人。',
    loadError: '无法加载名单。',
    claimLocked: '球员已认领，不可修改。',
  },
  en: {
    status: 'Entry status',
    rosterDeadline: 'Roster deadline',
    locked: 'The roster deadline has passed.',
    nameZh: 'Chinese name',
    nameEn: 'English name',
    idPartial: 'ID (letter + 4 digits)',
    staffId: 'Staff ID (optional)',
    jersey: 'Jersey #',
    add: 'Add player',
    save: 'Save',
    remove: 'Remove',
    copyInvite: 'Copy invite link',
    copied: 'Link copied',
    joined: 'Joined',
    listed: 'Pending',
    countHint: 'Roster must stay between 5 and 20 players.',
    loadHint: 'Could not load roster.',
    claimLocked: 'Player claimed — cannot edit.',
  },
};

export default function TeamRosterManager({ teamId, lang }: { teamId: string; lang: Lang }) {
  const t = UI[lang];
  const [data, setData] = useState<RosterData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [newRow, setNewRow] = useState({
    nameZh: '',
    nameEn: '',
    idPartial: '',
    staffId: '',
    jerseyNumber: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState({
    nameZh: '',
    nameEn: '',
    idPartial: '',
    staffId: '',
    jerseyNumber: '',
  });
  const [copyMsg, setCopyMsg] = useState('');

  const load = useCallback(async () => {
    setError('');
    const res = await fetch(`/api/account/teams/${teamId}/roster`);
    if (!res.ok) {
      setError(t.loadError ?? t.loadHint ?? 'Error');
      return;
    }
    setData(await res.json());
  }, [teamId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.editable) return;
    setBusy(true);
    const res = await fetch(`/api/account/teams/${teamId}/roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRow,
        jerseyNumber: Number(newRow.jerseyNumber),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError(t.countHint);
      return;
    }
    setNewRow({ nameZh: '', nameEn: '', idPartial: '', staffId: '', jerseyNumber: '' });
    await load();
  }

  async function saveEdit(membershipId: string) {
    if (!data?.editable) return;
    setBusy(true);
    const res = await fetch(`/api/account/teams/${teamId}/roster/${membershipId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editRow,
        jerseyNumber: Number(editRow.jerseyNumber),
      }),
    });
    setBusy(false);
    if (!res.ok) return;
    setEditId(null);
    await load();
  }

  async function removePlayer(membershipId: string) {
    if (!data?.editable || !confirm('OK?')) return;
    setBusy(true);
    await fetch(`/api/account/teams/${teamId}/roster/${membershipId}`, { method: 'DELETE' });
    setBusy(false);
    await load();
  }

  async function copyInvite(membershipId: string) {
    const res = await fetch(`/api/account/teams/${teamId}/roster/${membershipId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang }),
    });
    if (!res.ok) return;
    const { url } = (await res.json()) as { url: string };
    try {
      await navigator.clipboard.writeText(url);
      setCopyMsg(t.copied);
      setTimeout(() => setCopyMsg(''), 2000);
    } catch {
      window.prompt('URL', url);
    }
    await load();
  }

  if (!data) {
    return <p className="text-gray-500">{error || '…'}</p>;
  }

  return (
    <div className="space-y-6">
      <motionSummary data={data} lang={lang} t={t} copyMsg={copyMsg} />
      {!data.editable ? <p className="text-amber-700 text-base">{t.locked}</p> : null}
      <p className="text-sm text-gray-500">{t.countHint}</p>

      <ul className="space-y-3">
        {data.players.map((p) => (
          <li key={p.id} className="card text-base space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-primary">
                #{p.jerseyNumber}{' '}
                {p.nameZh || p.nameEn}
                <span className="text-gray-500 text-sm ml-2">
                  {p.memberJoined ? t.joined : t.listed}
                </span>
              </span>
              <motionActions
                editable={data.editable}
                p={p}
                editId={editId}
                setEditId={setEditId}
                editRow={editRow}
                setEditRow={setEditRow}
                saveEdit={saveEdit}
                removePlayer={removePlayer}
                copyInvite={copyInvite}
                busy={busy}
                t={t}
              />
            </div>
            {editId === p.id ? (
              <EditFields row={editRow} setRow={setEditRow} t={t} />
            ) : null}
          </li>
        ))}
      </ul>

      {data.editable ? (
        <form onSubmit={addPlayer} className="card space-y-3">
          <h3 className="font-heading font-semibold text-primary">{t.add}</h3>
          <EditFields
            row={{
              nameZh: newRow.nameZh,
              nameEn: newRow.nameEn,
              idPartial: newRow.idPartial,
              staffId: newRow.staffId,
              jerseyNumber: newRow.jerseyNumber,
            }}
            setRow={(r) =>
              setNewRow({
                nameZh: r.nameZh,
                nameEn: r.nameEn,
                idPartial: r.idPartial,
                staffId: r.staffId,
                jerseyNumber: r.jerseyNumber,
              })
            }
            t={t}
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-primary min-h-11 w-full sm:w-auto px-6 text-base"
          >
            {t.add}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function motionSummary({
  data,
  lang,
  t,
  copyMsg,
}: {
  data: RosterData;
  lang: Lang;
  t: Record<string, string>;
  copyMsg: string;
}) {
  const deadline = data.rosterBy
    ? new Date(data.rosterBy).toLocaleString(lang === 'en' ? 'en-HK' : 'zh-HK', { timeZone: 'Asia/Hong_Kong' })
    : '—';
  return (
    <motionSummaryInner data={data} t={t} deadline={deadline} copyMsg={copyMsg} />
  );
}

function motionSummaryInner({
  data,
  t,
  deadline,
  copyMsg,
}: {
  data: RosterData;
  t: Record<string, string>;
  deadline: string;
  copyMsg: string;
}) {
  return (
    <motionSummaryCard data={data} t={t} deadline={deadline} copyMsg={copyMsg} />
  );
}

function motionSummaryCard({
  data,
  t,
  deadline,
  copyMsg,
}: {
  data: RosterData;
  t: Record<string, string>;
  deadline: string;
  copyMsg: string;
}) {
  return (
    <div className="card text-base space-y-1">
      <p className="font-medium text-primary">{data.team.name}</p>
      <p className="text-gray-600">{data.team.bank}</p>
      {data.entry ? (
        <p>
          {t.status}：{data.entry.competitionTitle} · {data.entry.ref} · {data.entry.status}
        </p>
      ) : null}
      <p>
        {t.rosterDeadline}：{deadline}
      </p>
      {copyMsg ? <p className="text-orange text-sm">{copyMsg}</p> : null}
    </div>
  );
}

function motionActions(props: {
  editable: boolean;
  p: RosterPlayer;
  editId: string | null;
  setEditId: (id: string | null) => void;
  editRow: { nameZh: string; nameEn: string; idPartial: string; staffId: string; jerseyNumber: string };
  setEditRow: (r: typeof props.editRow) => void;
  saveEdit: (id: string) => void;
  removePlayer: (id: string) => void;
  copyInvite: (id: string) => void;
  busy: boolean;
  t: Record<string, string>;
}) {
  const { editable, p, editId, setEditId, editRow, setEditRow, saveEdit, removePlayer, copyInvite, busy, t } =
    props;
  if (!editable) return null;
  return (
    <motionActionButtons
      p={p}
      editId={editId}
      setEditId={setEditId}
      setEditRow={setEditRow}
      saveEdit={saveEdit}
      removePlayer={removePlayer}
      copyInvite={copyInvite}
      busy={busy}
      t={t}
    />
  );
}

function motionActionButtons({
  p,
  editId,
  setEditId,
  setEditRow,
  saveEdit,
  removePlayer,
  copyInvite,
  busy,
  t,
}: {
  p: RosterPlayer;
  editId: string | null;
  setEditId: (id: string | null) => void;
  setEditRow: (r: {
    nameZh: string;
    nameEn: string;
    idPartial: string;
    staffId: string;
    jerseyNumber: string;
  }) => void;
  saveEdit: (id: string) => void;
  removePlayer: (id: string) => void;
  copyInvite: (id: string) => void;
  busy: boolean;
  t: Record<string, string>;
}) {
  return (
    <motionActionButtonRow
      p={p}
      editId={editId}
      setEditId={setEditId}
      setEditRow={setEditRow}
      saveEdit={saveEdit}
      removePlayer={removePlayer}
      copyInvite={copyInvite}
      busy={busy}
      t={t}
    />
  );
}

function motionActionButtonRow(props: Parameters<typeof actionButtonRow>[0]) {
  return actionButtonRow(props);
}

function actionButtonRow({
  p,
  editId,
  setEditId,
  setEditRow,
  saveEdit,
  removePlayer,
  copyInvite,
  busy,
  t,
}: {
  p: RosterPlayer;
  editId: string | null;
  setEditId: (id: string | null) => void;
  setEditRow: (r: {
    nameZh: string;
    nameEn: string;
    idPartial: string;
    staffId: string;
    jerseyNumber: string;
  }) => void;
  saveEdit: (id: string) => void;
  removePlayer: (id: string) => void;
  copyInvite: (id: string) => void;
  busy: boolean;
  t: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {!p.memberJoined ? (
        <>
          <button
            type="button"
            className="min-h-11 px-3 text-sm border border-gray-200 rounded-lg"
            disabled={busy}
            onClick={() => {
              if (editId === p.id) {
                saveEdit(p.id);
              } else {
                setEditId(p.id);
                setEditRow({
                  nameZh: p.nameZh,
                  nameEn: p.nameEn,
                  idPartial: p.idPartial,
                  staffId: p.staffId,
                  jerseyNumber: String(p.jerseyNumber),
                });
              }
            }}
          >
            {editId === p.id ? t.save : t.save}
          </button>
          <button
            type="button"
            className="min-h-11 px-3 text-sm text-red-700 border border-red-200 rounded-lg"
            disabled={busy}
            onClick={() => removePlayer(p.id)}
          >
            {t.remove}
          </button>
        </>
      ) : null}
      <button
        type="button"
        className="min-h-11 px-3 text-sm bg-orange/10 text-orange rounded-lg"
        disabled={busy || p.memberJoined}
        onClick={() => copyInvite(p.id)}
      >
        {t.copyInvite}
      </button>
    </div>
  );
}

function EditFields({
  row,
  setRow,
  t,
}: {
  row: {
    nameZh: string;
    nameEn: string;
    idPartial: string;
    staffId: string;
    jerseyNumber: string;
  };
  setRow: (r: typeof row) => void;
  t: Record<string, string>;
}) {
  const field = (key: keyof typeof row, label: string) => (
    <label className="block text-sm">
      <span className="text-gray-600">{label}</span>
      <input
        className="mt-1 w-full min-h-11 border border-gray-200 rounded-lg px-3 text-base"
        value={row[key]}
        onChange={(e) => setRow({ ...row, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {field('nameZh', t.nameZh)}
      {field('nameEn', t.nameEn)}
      {field('idPartial', t.idPartial)}
      {field('staffId', t.staffId)}
      {field('jerseyNumber', t.jersey)}
    </div>
  );
}