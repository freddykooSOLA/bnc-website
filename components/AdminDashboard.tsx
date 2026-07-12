'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LeagueConfig } from '@/types';
import { extractZhHkFields } from '@/lib/config-helpers';
import type { SiteConfig } from '@/types';

interface AdminDashboardProps {
  initialConfig: SiteConfig;
}

type TabKey = 'site' | 'hero' | 'about' | 'footer' | 'nav' | 'leagues' | 'seo';

/** 管理后台主面板（仅繁体中文输入，自动转三语） */
export default function AdminDashboard({ initialConfig }: AdminDashboardProps) {
  const router = useRouter();
  const [fields, setFields] = useState(() => extractZhHkFields(initialConfig));
  const [activeTab, setActiveTab] = useState<TabKey>('site');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function updateField(path: string[], value: unknown) {
    setFields((prev) => {
      const next = structuredClone(prev);
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]] as Record<string, unknown>;
      }
      obj[path[path.length - 1]] = value;
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('保存失败');
      setMessage('保存成功！簡體及英文版本已自動生成。');
      router.refresh();
    } catch {
      setMessage('保存失敗，請重試。');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(type: 'logo' | 'favicon' | 'hero-bg', file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('上传失败');
      const data = await res.json();
      if (type === 'logo') updateField(['logo'], data.path);
      else if (type === 'favicon') updateField(['favicon'], data.path);
      else updateField(['hero', 'backgroundImage'], data.path);
      setMessage(`${type} 上傳成功！`);
    } catch {
      setMessage('上傳失敗，請重試。');
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'site', label: '站點設置' },
    { key: 'hero', label: '首頁 Hero' },
    { key: 'nav', label: '導航菜單' },
    { key: 'about', label: '關於我們' },
    { key: 'footer', label: '頁腳' },
    { key: 'leagues', label: '聯賽管理' },
    { key: 'seo', label: 'SEO 設置' },
  ];

  function addLeague(isArchive: boolean) {
    const newLeague: LeagueConfig = {
      id: `league-${Date.now()}`,
      league: '新聯賽',
      season: '新賽季',
      url: 'https://www.scorelab.tech/season/',
    };
    const key = isArchive ? 'archiveLeagues' : 'leagues';
    updateField(['matches', key], [...fields.matches[key], newLeague]);
  }

  function updateLeague(
    key: 'leagues' | 'archiveLeagues',
    idx: number,
    field: keyof LeagueConfig,
    value: string
  ) {
    const list = [...fields.matches[key]];
    list[idx] = { ...list[idx], [field]: value };
    updateField(['matches', key], list);
  }

  function removeLeague(key: 'leagues' | 'archiveLeagues', idx: number) {
    const list = fields.matches[key].filter((_, i) => i !== idx);
    updateField(['matches', key], list);
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">BNC 管理後台</h1>
        <div className="flex items-center gap-4">
          <a href="/zh-hk" target="_blank" className="text-sm text-white/70 hover:text-white">
            預覽網站 ↗
          </a>
          <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
            登出
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-56 bg-white border-r border-gray-200 p-4 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'bg-orange/10 text-orange font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
            只需輸入繁體中文，保存後系統會自動生成簡體中文及英文版本。
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {activeTab === 'site' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-primary">站點設置</h2>
                <Field label="網站名稱（繁體）">
                  <input value={fields.siteName} onChange={(e) => updateField(['siteName'], e.target.value)} className="input-field" />
                </Field>
                <Field label="Logo 上傳">
                  <UploadField path={fields.logo} accept="image/*" onUpload={(f) => handleUpload('logo', f)} />
                </Field>
                <Field label="Favicon 上傳">
                  <UploadField path={fields.favicon} accept="image/*,.ico" onUpload={(f) => handleUpload('favicon', f)} />
                </Field>
                <Field label="聯絡電話">
                  <input value={fields.contact.phone} onChange={(e) => updateField(['contact', 'phone'], e.target.value)} className="input-field" />
                </Field>
                <Field label="聯絡電郵">
                  <input value={fields.contact.email} onChange={(e) => updateField(['contact', 'email'], e.target.value)} className="input-field" />
                </Field>
                <Field label="地址（繁體）">
                  <input value={fields.contact.address} onChange={(e) => updateField(['contact', 'address'], e.target.value)} className="input-field" />
                </Field>
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-sm text-gray-700">社交平台連結</h3>
                  <Field label="YouTube">
                    <input value={fields.socialLinks.youtube} onChange={(e) => updateField(['socialLinks', 'youtube'], e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Facebook">
                    <input value={fields.socialLinks.facebook} onChange={(e) => updateField(['socialLinks', 'facebook'], e.target.value)} className="input-field" />
                  </Field>
                  <Field label="Instagram">
                    <input value={fields.socialLinks.instagram} onChange={(e) => updateField(['socialLinks', 'instagram'], e.target.value)} className="input-field" />
                  </Field>
                  <Field label="WhatsApp（例：https://wa.me/85292133533）">
                    <input value={fields.socialLinks.whatsapp} onChange={(e) => updateField(['socialLinks', 'whatsapp'], e.target.value)} className="input-field" />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary">首頁 Hero 設定</h2>
                <Field label="主標題（繁體）">
                  <input value={fields.hero.title} onChange={(e) => updateField(['hero', 'title'], e.target.value)} className="input-field" />
                </Field>
                <Field label="副標題（繁體）">
                  <textarea value={fields.hero.subtitle} onChange={(e) => updateField(['hero', 'subtitle'], e.target.value)} className="input-field" rows={2} />
                </Field>
                <Field label="CTA 按鈕文字（繁體）">
                  <input value={fields.hero.ctaText} onChange={(e) => updateField(['hero', 'ctaText'], e.target.value)} className="input-field" />
                </Field>
                <Field label="背景圖片上傳">
                  <UploadField path={fields.hero.backgroundImage} accept="image/*" onUpload={(f) => handleUpload('hero-bg', f)} />
                </Field>
              </div>
            )}

            {activeTab === 'nav' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary">導航菜單</h2>
                {(['home', 'about', 'matches'] as const).map((key) => (
                  <Field key={key} label={key}>
                    <input value={fields.nav[key]} onChange={(e) => updateField(['nav', key], e.target.value)} className="input-field" />
                  </Field>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary">關於我們</h2>
                <Field label="正文（Markdown，繁體）">
                  <textarea value={fields.about.content} onChange={(e) => updateField(['about', 'content'], e.target.value)} className="input-field font-mono text-sm" rows={16} />
                </Field>
              </div>
            )}

            {activeTab === 'footer' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary">頁腳</h2>
                <Field label="版權聲明（繁體）">
                  <input value={fields.footer.copyright} onChange={(e) => updateField(['footer', 'copyright'], e.target.value)} className="input-field" />
                </Field>
              </div>
            )}

            {activeTab === 'leagues' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-primary">聯賽管理</h2>
                <Field label="顯示往期比賽 Tab">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={fields.matches.showArchive} onChange={(e) => updateField(['matches', 'showArchive'], e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm">開啟</span>
                  </label>
                </Field>

                <LeagueList
                  title="最新比賽聯賽"
                  leagues={fields.matches.leagues}
                  onUpdate={(idx, field, val) => updateLeague('leagues', idx, field, val)}
                  onRemove={(idx) => removeLeague('leagues', idx)}
                  onAdd={() => addLeague(false)}
                />

                <LeagueList
                  title="往期比賽聯賽"
                  leagues={fields.matches.archiveLeagues}
                  onUpdate={(idx, field, val) => updateLeague('archiveLeagues', idx, field, val)}
                  onRemove={(idx) => removeLeague('archiveLeagues', idx)}
                  onAdd={() => addLeague(true)}
                />
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-primary">SEO 設置（繁體）</h2>
                {(['home', 'about', 'matches'] as const).map((page) => (
                  <div key={page} className="border-t pt-4">
                    <h3 className="font-semibold text-sm text-gray-700 mb-3 capitalize">{page}</h3>
                    <div className="space-y-3">
                      <Field label="標題">
                        <input value={fields.seo[page].title} onChange={(e) => updateField(['seo', page, 'title'], e.target.value)} className="input-field" />
                      </Field>
                      <Field label="描述">
                        <textarea value={fields.seo[page].description} onChange={(e) => updateField(['seo', page, 'description'], e.target.value)} className="input-field" rows={2} />
                      </Field>
                      {page === 'home' && (
                        <Field label="關鍵詞">
                          <input value={fields.seo.home.keywords} onChange={(e) => updateField(['seo', 'home', 'keywords'], e.target.value)} className="input-field" />
                        </Field>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? '保存中...' : '保存所有更改'}
            </button>
            {message && (
              <span className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </span>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input-field:focus {
          border-color: #f7931e;
          box-shadow: 0 0 0 2px rgba(247, 147, 30, 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function UploadField({ path, accept, onUpload }: { path: string; accept: string; onUpload: (f: File) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-500">{path}</span>
      <input type="file" accept={accept} onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} className="text-sm" />
    </div>
  );
}

function LeagueList({
  title,
  leagues,
  onUpdate,
  onRemove,
  onAdd,
}: {
  title: string;
  leagues: LeagueConfig[];
  onUpdate: (idx: number, field: keyof LeagueConfig, val: string) => void;
  onRemove: (idx: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
        <button onClick={onAdd} className="text-sm text-orange hover:text-orange-600 font-medium">+ 新增</button>
      </div>
      {leagues.map((league, idx) => (
        <div key={league.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
          <input value={league.league} onChange={(e) => onUpdate(idx, 'league', e.target.value)} className="input-field" placeholder="聯賽名稱" />
          <input value={league.season} onChange={(e) => onUpdate(idx, 'season', e.target.value)} className="input-field" placeholder="賽季名稱" />
          <input value={league.url} onChange={(e) => onUpdate(idx, 'url', e.target.value)} className="input-field md:col-span-1" placeholder="ScoreLab URL" />
          <button onClick={() => onRemove(idx)} className="text-sm text-red-500 hover:text-red-700">刪除</button>
        </div>
      ))}
      {leagues.length === 0 && <p className="text-sm text-gray-400">暫無聯賽</p>}
    </div>
  );
}
