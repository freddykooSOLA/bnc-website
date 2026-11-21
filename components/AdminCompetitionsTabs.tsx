'use client';

import { useState } from 'react';
import AdminCompetitionsPanel from '@/components/AdminCompetitionsPanel';
import AdminPlayerLinksPanel from '@/components/AdminPlayerLinksPanel';
import AdminScorelabSyncPanel from '@/components/AdminScorelabSyncPanel';

export default function AdminCompetitionsTabs() {
  const [tab, setTab] = useState<'entries' | 'links' | 'scorelab'>('entries');

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
        <button
          type="button"
          className={`min-h-11 px-4 rounded-lg text-base ${
            tab === 'scorelab' ? 'bg-orange/10 text-orange font-semibold' : 'bg-white border'
          }`}
          onClick={() => setTab('scorelab')}
        >
          ScoreLab 同步
        </button>
      </div>
      {tab === 'entries' ? (
        <AdminCompetitionsPanel />
      ) : tab === 'links' ? (
        <AdminPlayerLinksPanel />
      ) : (
        <AdminScorelabSyncPanel />
      )}
    </div>
  );
}