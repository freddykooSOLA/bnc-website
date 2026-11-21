'use client';

import { useCallback, useEffect, useState } from 'react';

type LinkRow = {
  id: string;
  status: string;
  leagueId: string;
  playerId: string;
  leagueLabel: string;
  memberName: string;
  memberEmail: string;
};

export default function AdminPlayerLinksPanel() {
  const [links, setLinks] = useState<LinkRow[]>([]);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/player-links');
    if (res.ok) {
      const j = (await res.json()) as { links: LinkRow[] };
      setLinks(j.links);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, status: 'approved' | 'rejected') {
    const res = await fetch(`/api/admin/player-links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
    else if (res.status === 409) alert('此 ScoreLab 球員已被另一位會員連結。');
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary">球員數據連結審批</h1>
      {links.length === 0 ? (
        <p className="text-base text-gray-600">暫無連結申請。</p>
      ) : (
        <ul className="space-y-3">
          {links.map((l) => (
            <li key={l.id} className="bg-white border border-gray-200 rounded-lg p-4 text-base space-y-2">
              <p className="font-medium">
                {l.memberName} ({l.memberEmail})
              </p>
              <p>
                {l.leagueLabel} · {l.playerId} · {l.status}
              </p>
              {l.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="min-h-11 px-4 bg-green-600 text-white rounded-lg"
                    onClick={() => decide(l.id, 'approved')}
                  >
                    批准
                  </button>
                  <button
                    type="button"
                    className="min-h-11 px-4 border border-gray-300 rounded-lg"
                    onClick={() => decide(l.id, 'rejected')}
                  >
                    拒絕
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}