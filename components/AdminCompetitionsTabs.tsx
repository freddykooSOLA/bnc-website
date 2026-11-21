'use client';

import { useState } from 'react';
import AdminCompetitionsPanel from '@/components/AdminCompetitionsPanel';
import AdminPlayerLinksPanel from '@/components/AdminPlayerLinksPanel';

export default function AdminCompetitionsTabs() {
  const [tab, setTab] = useState<'entries' | 'links'>('entries');

  return (
    <div>
      <div className="flex gap-2 px-6 pt-4">
        <button
          type="button"
          className={`min-h-11 px-4 rounded-lg text-base ${
            tab === 'entries' ? 'bg-orange/10 text-orange font-semibold' : 'bg-white border'
          }`}
          onClick={() => setTab('entries')}
        >
          報名審批
        </button>
        <button
          type="button"
          className={`min-h-11 px-4 rounded-lg text-base ${
            tab === 'links' ? 'bg-orange/10 text-orange font-semibold' : 'bg-white border'
          }`}
          onClick={() => setTab('links')}
        >
          球員連結
        </button>
      </div>
      {tab === 'entries' ? <AdminCompetitionsPanel /> : <AdminPlayerLinksPanel />}
    </div>
  );
}