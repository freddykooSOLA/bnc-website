'use client';

import { useCallback, useEffect, useState } from 'react';

type SyncRun = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  ok: boolean;
  teams: number;
  players: number;
  errorsJson: string | null;
};

export default function AdminScorelabSyncPanel() {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/scorelab-sync');
    if (res.ok) {
      const j = (await res.json()) as { runs: SyncRun[] };
      setRuns(j.runs);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSync() {
    setSyncing(true);
    setMessage('');
    const res = await fetch('/api/admin/scorelab-sync', { method: 'POST' });
    if (res.ok) {
      const j = (await res.json()) as { ok: boolean; teams: number; players: number };
      setMessage(`同步完成：${j.teams} 隊 · ${j.players} 球員${j.ok ? '' : '（部分錯誤）'}`);
      await load();
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(j.error === 'unavailable' ? '資料庫未設定' : '同步失敗');
    }
    setSyncing(false);
  }

  return (
    <div className="p-6 max-w-3xl">
      <p className="text-base text-gray-600 mb-4">
        從 ScoreLab 公開頁拉取三個聯賽的球隊與球員，寫入網站資料庫。每日 04:00（香港時間）會自動同步。
      </p>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="btn-primary min-h-11 px-6 mb-6 disabled:opacity-60"
      >
        {syncing ? '同步中…' : '立即同步'}
      </button>
      {message ? <p className="text-base text-orange mb-4">{message}</p> : null}
      <h2 className="font-heading font-bold text-primary text-lg mb-3">最近 10 次同步</h2>
      {loading ? (
        <p className="text-base text-gray-500">載入中…</p>
      ) : runs.length === 0 ? (
        <p className="text-base text-gray-500">尚無紀錄</p>
      ) : (
        <ul className="card text-base space-y-3">
          {runs.map((r) => (
            <li key={r.id} className="border-b border-gray-100 pb-2 last:border-0">
              <p className="font-semibold">
                {new Date(r.startedAt).toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })}
                {' · '}
                {r.ok ? '成功' : '有失敗項目'}
              </p>
              <p className="text-gray-600">
                {r.teams} 隊 · {r.players} 球員
                {r.finishedAt
                  ? ` · ${Math.round((new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)} 秒`
                  : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}