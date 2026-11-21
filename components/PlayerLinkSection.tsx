'use client';

import { useEffect, useState } from 'react';
import type { Lang } from '@/types';

type League = { id: string; label: string };
type SearchHit = { playerId: string; name: string; teamName: string; gamesPlayed: number };
type LinkRow = { id: string; leagueId: string; playerId: string; status: string };

const COPY: Record<
  Lang,
  {
    title: string;
    pickLeague: string;
    search: string;
    searchBtn: string;
    submit: string;
    status: string;
    statsLink: string;
    none: string;
    pending: string;
  }
> = {
  'zh-hk': {
    title: '連結我的比賽數據',
    pickLeague: '選擇聯賽',
    search: '輸入姓名搜尋',
    searchBtn: '搜尋',
    submit: '提交連結申請',
    status: '狀態',
    statsLink: '查看我的數據與雷達',
    none: '尚未提交連結',
    pending: '待主辦審批',
  },
  'zh-cn': {
    title: '连结我的比赛数据',
    pickLeague: '选择联赛',
    search: '输入姓名搜索',
    searchBtn: '搜索',
    submit: '提交链接申请',
    status: '状态',
    statsLink: '查看我的数据与雷达',
    none: '尚未提交链接',
    pending: '待主办审批',
  },
  en: {
    title: 'Link my game stats',
    pickLeague: 'Choose league',
    search: 'Search by name',
    searchBtn: 'Search',
    submit: 'Submit link request',
    status: 'Status',
    statsLink: 'View my stats & radar',
    none: 'No link requests yet',
    pending: 'Pending organiser review',
  },
};

export default function PlayerLinkSection({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  const [leagues, setLeagues] = useState<League[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [leagueId, setLeagueId] = useState('');
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [selected, setSelected] = useState<SearchHit | null>(null);
  const [msg, setMsg] = useState('');

  async function refresh() {
    const [leagueRes, linkRes] = await Promise.all([
      fetch('/api/account/player-links/leagues'),
      fetch('/api/account/player-links'),
    ]);
    if (leagueRes.ok) {
      const j = (await leagueRes.json()) as { leagues: League[] };
      setLeagues(j.leagues);
      if (!leagueId && j.leagues[0]) setLeagueId(j.leagues[0].id);
    }
    if (linkRes.ok) {
      const j = (await linkRes.json()) as { links: LinkRow[] };
      setLinks(j.links);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!leagueId || !query.trim()) return;
    const res = await fetch(
      `/api/account/player-links/search?leagueId=${encodeURIComponent(leagueId)}&q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return;
    const j = (await res.json()) as { players: SearchHit[] };
    setHits(j.players);
    setSelected(null);
  }

  async function onSubmit() {
    if (!selected || !leagueId) return;
    const res = await fetch('/api/account/player-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leagueId, playerId: selected.playerId }),
    });
    if (res.ok) {
      setMsg(copy.pending);
      await refresh();
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-bold text-primary">{copy.title}</h2>
      <form onSubmit={onSearch} className="card space-y-3 text-base">
        <label className="block">
          <span className="text-gray-600">{copy.pickLeague}</span>
          <select
            className="mt-1 w-full min-h-11 border border-gray-200 rounded-lg px-3"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
          >
            {leagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
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
            {hits.map((h) => (
              <li key={h.playerId}>
                <button
                  type="button"
                  onClick={() => setSelected(h)}
                  className={`w-full text-left min-h-11 px-3 rounded-lg border ${
                    selected?.playerId === h.playerId ? 'border-orange bg-orange/5' : 'border-gray-200'
                  }`}
                >
                  {h.name} · {h.teamName} · {h.gamesPlayed} GP
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {selected ? (
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