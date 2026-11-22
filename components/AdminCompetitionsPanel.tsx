'use client';

import { useCallback, useEffect, useState } from 'react';

type RosterRow = {
  nameZh: string;
  nameEn: string;
  idPartial: string;
  jerseyNumber: number;
  status: string;
};

type Entry = {
  id: string;
  ref: string;
  status: string;
  rosterUnlocked: boolean;
  createdAt: string;
  statusUpdatedAt: string | null;
  leaderNameZh: string;
  leaderNameEn: string;
  teamName: string;
  bank: string;
  rosterCount: number;
  roster: RosterRow[];
};

type Competition = {
  id: string;
  slug: string;
  title: string;
  entries: Entry[];
};

const STATUSES = ['submitted', 'paid', 'confirmed', 'rejected'] as const;

export default function AdminCompetitionsPanel() {
  const [data, setData] = useState<Competition[]>([]);
  const [error, setError] = useState('');
  const [openEntry, setOpenEntry] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/competitions');
    if (!res.ok) {
      setError('無法載入報名資料（請確認資料庫已啟用）。');
      return;
    }
    const json = (await res.json()) as { competitions: Competition[] };
    setData(json.competitions);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(entryId: string, status: string) {
    const res = await fetch(`/api/admin/competitions/entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  async function setRosterUnlocked(entryId: string, rosterUnlocked: boolean) {
    const res = await fetch(`/api/admin/competitions/entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rosterUnlocked }),
    });
    if (res.ok) await load();
  }

  if (error) {
    return <p className="text-base text-red-700 p-6">{error}</p>;
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-primary">比賽報名審批</h1>
      {data.length === 0 ? (
        <p className="text-base text-gray-600">暫無報名紀錄。</p>
      ) : (
        data.map((comp) => (
          <section key={comp.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-primary">{comp.title}</h2>
              <a
                href={`/api/admin/competitions/${comp.id}/export`}
                className="min-h-11 inline-flex items-center px-4 text-base bg-orange/10 text-orange rounded-lg"
              >
                匯出 CSV
              </a>
            </div>
            <CompetitionEntriesTable
              entries={comp.entries}
              openEntry={openEntry}
              setOpenEntry={setOpenEntry}
              setStatus={setStatus}
              setRosterUnlocked={setRosterUnlocked}
            />
          </section>
        ))
      )}
    </div>
  );
}

function CompetitionEntriesTable({
  entries,
  openEntry,
  setOpenEntry,
  setStatus,
  setRosterUnlocked,
}: {
  entries: Entry[];
  openEntry: string | null;
  setOpenEntry: (id: string | null) => void;
  setStatus: (id: string, status: string) => void;
  setRosterUnlocked: (id: string, value: boolean) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <table className="w-full text-base min-w-[640px]">
        <thead>
          <tr className="border-b text-left text-gray-500 text-sm">
            <th className="p-3">球隊／銀行</th>
            <th className="p-3">領隊</th>
            <th className="p-3">人數</th>
            <th className="p-3">提交</th>
            <th className="p-3">狀態</th>
            <th className="p-3">操作</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <CompetitionEntryRows
              key={e.id}
              e={e}
              openEntry={openEntry}
              setOpenEntry={setOpenEntry}
              setStatus={setStatus}
              setRosterUnlocked={setRosterUnlocked}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompetitionEntryRows({
  e,
  openEntry,
  setOpenEntry,
  setStatus,
  setRosterUnlocked,
}: {
  e: Entry;
  openEntry: string | null;
  setOpenEntry: (id: string | null) => void;
  setStatus: (id: string, status: string) => void;
  setRosterUnlocked: (id: string, value: boolean) => void;
}) {
  const expanded = openEntry === e.id;
  return (
    <>
      <tr className="border-b border-gray-50">
        <td className="p-3">
          <p className="font-medium">{e.teamName}</p>
          <p className="text-sm text-gray-500">{e.bank}</p>
        </td>
        <td className="p-3 text-sm">
          {e.leaderNameZh}
          <br />
          {e.leaderNameEn}
        </td>
        <td className="p-3">{e.rosterCount}</td>
        <td className="p-3 text-sm text-gray-600">
          {new Date(e.createdAt).toLocaleString('zh-HK')}
          {e.statusUpdatedAt ? (
            <p className="text-xs">狀態：{new Date(e.statusUpdatedAt).toLocaleString('zh-HK')}</p>
          ) : null}
        </td>
        <td className="p-3 font-medium">{e.status}</td>
        <td className="p-3 space-y-2">
          <button
            type="button"
            className="min-h-11 px-3 text-sm border rounded-lg w-full"
            onClick={() => setOpenEntry(expanded ? null : e.id)}
          >
            {expanded ? '收起名單' : '查看名單'}
          </button>
          <select
            className="min-h-11 w-full border rounded-lg px-2 text-base"
            value={e.status}
            onChange={(ev) => setStatus(e.id, ev.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="flex gap-2 items-center text-sm min-h-11">
            <input
              type="checkbox"
              checked={e.rosterUnlocked}
              onChange={(ev) => setRosterUnlocked(e.id, ev.target.checked)}
              className="w-4 h-4"
            />
            解鎖名單（略過截止日）
          </label>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={6} className="p-4 bg-gray-50">
            <ul className="text-sm space-y-1">
              {e.roster.map((r) => (
                <li key={`${r.jerseyNumber}-${r.nameEn}`}>
                  #{r.jerseyNumber} {r.nameZh || r.nameEn} · {r.idPartial} · {r.status}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      ) : null}
    </>
  );
}