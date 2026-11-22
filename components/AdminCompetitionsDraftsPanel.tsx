'use client';

import { useCallback, useEffect, useState } from 'react';

type DraftRow = {
  id: string;
  ref: string;
  createdAt: string;
  competitionTitle: string;
  bank: string;
  leaderEmail: string;
  member: { email: string; displayName: string };
};

export default function AdminCompetitionsDraftsPanel() {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/competitions/drafts');
    if (!res.ok) {
      setError('無法載入草稿。');
      return;
    }
    const json = (await res.json()) as { drafts: DraftRow[] };
    setRows(json.drafts);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <p className="p-6 text-red-700">{error}</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-primary mb-4">報名草稿（只讀）</h2>
      {rows.length === 0 ? (
        <p className="text-gray-600">暫無草稿。</p>
      ) : (
        <table className="w-full bg-white border rounded-lg text-base">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-3">比賽</th>
              <th className="p-3">銀行</th>
              <th className="p-3">帳戶</th>
              <th className="p-3">更新</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-3">{row.competitionTitle}</td>
                <td className="p-3">{row.bank}</td>
                <td className="p-3">
                  {row.member.displayName}
                  <span className="block text-xs text-gray-500">{row.leaderEmail}</span>
                </td>
                <td className="p-3 text-sm">{row.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}