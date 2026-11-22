'use client';

import { useState } from 'react';
import type { Lang } from '@/types';

const UI: Record<
  Lang,
  {
    title: string;
    template: string;
    replace: string;
    append: string;
    preview: string;
    confirm: string;
    row: string;
    errors: string;
    busy: string;
    done: string;
  }
> = {
  'zh-hk': {
    title: 'Excel／CSV 匯入名單',
    template: '下載範本',
    replace: '取代現有名單',
    append: '加到現有名單',
    preview: '上載並預覽',
    confirm: '確認匯入',
    row: '行',
    errors: '錯誤',
    busy: '處理中…',
    done: '已匯入',
  },
  'zh-cn': {
    title: 'Excel／CSV 导入名单',
    template: '下载模板',
    replace: '取代现有名单',
    append: '加到现有名单',
    preview: '上传并预览',
    confirm: '确认导入',
    row: '行',
    errors: '错误',
    busy: '处理中…',
    done: '已导入',
  },
  en: {
    title: 'Import roster (Excel / CSV)',
    template: 'Download template',
    replace: 'Replace current roster',
    append: 'Add to current roster',
    preview: 'Upload & preview',
    confirm: 'Confirm import',
    row: 'Row',
    errors: 'Errors',
    busy: 'Working…',
    done: 'Imported',
  },
};

type PreviewRow = {
  rowNumber: number;
  nameZh: string;
  nameEn: string;
  jerseyNumber: number;
  errors: string[];
};

export default function TeamRosterImport({
  teamId,
  lang,
  editable,
  onImported,
}: {
  teamId: string;
  lang: Lang;
  editable: boolean;
  onImported: () => void;
}) {
  const t = UI[lang];
  const [file, setFile] = useState<File | null>(null);
  const [replace, setReplace] = useState(false);
  const [rows, setRows] = useState<PreviewRow[] | null>(null);
  const [hasErrors, setHasErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!editable) return null;

  async function upload(mode: 'preview' | 'confirm') {
    if (!file) return;
    setBusy(true);
    setMsg('');
    const form = new FormData();
    form.set('file', file);
    form.set('mode', mode);
    form.set('replace', replace ? 'true' : 'false');
    const res = await fetch(`/api/account/teams/${teamId}/roster/import`, {
      method: 'POST',
      body: form,
    });
    setBusy(false);
    if (mode === 'preview') {
      if (!res.ok) {
        setMsg('無法預覽檔案。');
        return;
      }
      const json = (await res.json()) as { preview: PreviewRow[]; hasErrors: boolean };
      setRows(json.preview);
      setHasErrors(json.hasErrors);
      return;
    }
    if (!res.ok) {
      setMsg('匯入失敗。');
      return;
    }
    setMsg(t.done);
    setRows(null);
    setFile(null);
    onImported();
  }

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-primary">{t.title}</h2>
        <a
          href="/downloads/yinyuan-cup-2027-roster-template.xlsx"
          className="min-h-11 inline-flex items-center px-4 text-base text-orange underline"
          download
        >
          {t.template}
        </a>
      </div>
      <label className="flex gap-2 items-center text-base min-h-11">
        <input
          type="checkbox"
          checked={replace}
          onChange={(e) => setReplace(e.target.checked)}
          className="w-4 h-4"
        />
        {replace ? t.replace : t.append}
      </label>
      <input
        type="file"
        accept=".xlsx,.csv"
        className="text-base min-h-11"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setRows(null);
        }}
      />
      <button
        type="button"
        className="min-h-11 px-4 rounded-lg bg-orange text-white disabled:opacity-50"
        disabled={!file || busy}
        onClick={() => void upload('preview')}
      >
        {busy ? t.busy : t.preview}
      </button>
      {rows ? (
        <ul className="space-y-2 text-sm max-h-80 overflow-y-auto">
          {rows.map((r) => (
            <li
              key={r.rowNumber}
              className={`p-2 rounded border ${r.errors.length ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            >
              <span className="font-medium">
                {t.row} {r.rowNumber}: {r.nameZh || r.nameEn} #{r.jerseyNumber}
              </span>
              {r.errors.length ? (
                <p className="text-red-700">
                  {t.errors}: {r.errors.join('；')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {rows && !hasErrors ? (
        <button
          type="button"
          className="min-h-11 px-4 rounded-lg border border-orange text-orange font-medium"
          disabled={busy}
          onClick={() => void upload('confirm')}
        >
          {t.confirm}
        </button>
      ) : null}
      {msg ? <p className="text-green-700">{msg}</p> : null}
    </section>
  );
}