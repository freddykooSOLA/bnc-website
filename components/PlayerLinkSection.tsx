'use client';

import { useEffect, useState } from 'react';
import type { Lang } from '@/types';

type SearchHit = {
  leagueId: string;
  leagueLabel: string;
  playerId: string;
  name: string;
  teamName: string;
  number?: string;
  image?: string;
  gamesPlayed: number;
};
type LinkRow = { id: string; leagueId: string; playerId: string; status: string };

const COPY: Record<
  Lang,
  {
    title: string;
    search: string;
    searchBtn: string;
    submit: string;
    status: string;
    statsLink: string;
    none: string;
    pending: string;
    pick: string;
  }
> = {
  'zh-hk': {
    title: '連結我的比賽數據',
    search: '輸入姓名搜尋（跨聯賽）',
    searchBtn: '搜尋',
    submit: '提交所選連結申請',
    status: '狀態',
    statsLink: '查看我的數據與雷達',
    none: '尚未提交連結',
    pending: '已提交，待主辦審批',
    pick: '可多選（同一人在不同聯賽會有不同球員紀錄）',
  },
  'zh-cn': {
    title: '连结我的比赛数据',
    search: '输入姓名搜索（跨联赛）',
    searchBtn: '搜索',
    submit: '提交所选链接申请',
    status: '状态',
    statsLink: '查看我的数据与雷达',
    none: '尚未提交链接',
    pending: '已提交，待主办审批',
    pick: '可多选（同一人在不同联赛会有不同球员纪录）',
  },
  en: {
    title: 'Link my game stats',
    search: 'Search by name (all leagues)',
    searchBtn: 'Search',
    submit: 'Submit selected link requests',
    status: 'Status',
    statsLink: 'View my stats & radar',
    none: 'No link requests yet',
    pending: 'Submitted — pending organiser review',
    pick: 'Select one or more profiles (each league has its own player record)',
  },
};

function hitKey(h: SearchHit) {
  return `${h.leagueId}:${h.playerId}`;
}

export default function PlayerLinkSection({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  async function refresh() {
    const linkRes = await fetch('/api/account/player-links');
    if (linkRes.ok) {
      const j = (await linkRes.json()) as { links: LinkRow[] };
      setLinks(j.links);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/account/player-links/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return;
    const j = (await res.json()) as { players: SearchHit[] };
    setHits(j.players);
    setSelected(new Set());
  }

  function toggleHit(h: SearchHit) {
    const key = hitKey(h);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function onSubmit() {
    const chosen = hits.filter((h) => selected.has(hitKey(h)));
    if (chosen.length === 0) return;
    for (const h of chosen) {
      await fetch('/api/account/player-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: h.leagueId, playerId: h.playerId }),
      });
    }
    setMsg(copy.pending);
    await refresh();
    setSelected(new Set());
  }

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-primary">{copy.title}</h2>
      <form onSubmit={onSearch} className="card space-y-3 text-base">
        <p className="text-sm text-gray-500">{copy.pick}</p>
        <label className="block">
          <span className="text-gray-600">{copy.search}</span>
          <input
            className="mt-1 w-full min-h-11 border border-gray-200 rounded-lg px-3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button type="submit" className="btn-primary min-h-11 px-6">
          {copy.searchBtn}
        </button>
        {hits.length > 0 ? (
          <ul className="space-y-2">
            {hits.map((h) => {
              const key = hitKey(h);
              const on = selected.has(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleHit(h)}
                    className={`w-full text-left min-h-11 px-3 py-2 rounded-lg border flex gap-3 items-center ${
                      on ? 'border-orange bg-orange/5' : 'border-gray-200'
                    }`}
                  >
                    {h.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={h.image}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-100"
                      />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-gray-100 shrink-0" aria-hidden />
                    )}
                    <span>
                      <span className="block font-medium">{h.name}</span>
                      <span className="block text-sm text-gray-600">
                        {h.leagueLabel} · {h.teamName}
                        {h.number ? ` · #${h.number}` : ''} · {h.gamesPlayed} GP
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {selected.size > 0 ? (
          <button type="button" onClick={onSubmit} className="btn-primary min-h-11 w-full">
            {copy.submit}
          </button>
        ) : null}
        {msg ? <p className="text-sm text-orange">{msg}</p> : null}
      </form>

      <ul className="card text-sm space-y-2">
        {links.length === 0 ? (
          <li>{copy.none}</li>
        ) : (
          links.map((l) => (
            <li key={l.id}>
              {l.leagueId} / {l.playerId} · {copy.status} {l.status}
            </li>
          ))
        )}
      </ul>
      <a href={`/${lang}/account/stats`} className="inline-flex min-h-11 items-center text-orange text-base">
        {copy.statsLink}
      </a>
    </section>
  );
}