'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Lang } from '@/types';
import type { Competition } from '@/lib/competitions';

const DECLARATIONS: Record<Lang, string[]> = {
  'zh-hk': [
    '本隊確認所有隊員均屬本銀行職員。',
    '本隊確認報名資料屬實並符合參加資格；虛報或棄權不獲退費。',
    '本隊願意服從大會抽籤結果。',
    '本隊願遵守賽會規則並於出賽前提交證件正本供核對。',
    '本隊所有隊員健康及體能良好，適宜參加活動；主辦機構不負疏忽傷亡責任。',
  ],
  'zh-cn': [
    '本队确认所有队员均属本银行职员。',
    '本队确认报名资料属实并符合参加资格；虚报或弃权不获退费。',
    '本队愿意服从大会抽签结果。',
    '本队愿遵守赛会规则并于出赛前提交证件正本供核对。',
    '本队所有队员健康及体能良好，适宜参加活动；主办机构不负疏忽伤亡责任。',
  ],
  en: [
    'All players are staff of our member bank.',
    'All information is true and meets eligibility; false entries forfeit fees.',
    'We accept the draw results.',
    'We accept rules and will present ID at check-in.',
    'Players are fit to participate; the organiser is not liable for negligence or injury.',
  ],
};

const UI: Record<Lang, Record<string, string>> = {
  'zh-hk': {
    bank: '銀行',
    jersey1: '球衣顏色 (1)',
    jersey2: '球衣顏色 (2)',
    leaderZh: '領隊姓名（中文）',
    leaderEn: '領隊姓名（英文）',
    leaderId: '身份證明文件（英文字母＋首四位）',
    email: '電郵地址',
    mobile: '手提電話',
    emergency: '緊急聯絡電話',
    players: '球員名單（可留空，之後再補；最多 20 人）',
    playersOptional: '名單可報名後再補；如現時填寫，請確保球衣號碼不重複。',
    saveDraft: '儲存草稿',
    draftSaved: '草稿已儲存。',
    draftSaving: '儲存中…',
    localRestoreTitle: '載入未儲存的內容？',
    localRestoreYes: '載入',
    localRestoreNo: '捨棄',
    nextSteps:
      '請以劃線支票繳交報名費（抬頭 Superlearning (Hong Kong) Limited）→ 大會確認後，登入「我的球隊」上載球員名單。',
    nameZh: '中文姓名',
    nameEn: '英文姓名',
    idPartial: '身份證首四位',
    staffId: '銀行職員證號碼（選填）',
    jerseyNo: '球衣號碼',
    addPlayer: '新增球員',
    declTitle: '領隊聲明書',
    declBank: '銀行名稱（聲明）',
    declSign: '領隊簽署姓名',
    submit: '提交報名',
    submitting: '提交中…',
    successRef: '參考編號',
    successPay: '繳費方法',
    validation: '請檢查標示欄位。',
    offline: '網上報名暫未開放，請下載表格電郵 superlearninghkltd@gmail.com',
    closed: '報名已截止。',
    duplicate: '您已為此比賽提交過球隊報名。',
  },
  'zh-cn': {
    bank: '银行',
    jersey1: '球衣颜色 (1)',
    jersey2: '球衣颜色 (2)',
    leaderZh: '领队姓名（中文）',
    leaderEn: '领队姓名（英文）',
    leaderId: '身份证明文件（英文字母＋首四位）',
    email: '电邮地址',
    mobile: '手提电话',
    emergency: '紧急联络电话',
    players: '球员名单（可留空，之后再补；最多 20 人）',
    playersOptional: '名单可报名后再补；如现时填写，请确保球衣号码不重复。',
    saveDraft: '保存草稿',
    draftSaved: '草稿已保存。',
    draftSaving: '保存中…',
    localRestoreTitle: '加载未保存的内容？',
    localRestoreYes: '加载',
    localRestoreNo: '丢弃',
    nextSteps:
      '请以划线支票缴交报名费（抬头 Superlearning (Hong Kong) Limited）→ 大会确认后，登录「我的球队」上传球员名单。',
    nameZh: '中文姓名',
    nameEn: '英文姓名',
    idPartial: '身份证首四位',
    staffId: '银行职员证号码（选填）',
    jerseyNo: '球衣号码',
    addPlayer: '新增球员',
    declTitle: '领队声明书',
    declBank: '银行名称（声明）',
    declSign: '领队签署姓名',
    submit: '提交报名',
    submitting: '提交中…',
    successRef: '参考编号',
    successPay: '缴费方法',
    validation: '请检查标示栏位。',
    offline: '网上报名暂未开放，请下载表格电邮 superlearninghkltd@gmail.com',
    closed: '报名已截止。',
    duplicate: '您已为此比赛提交过球队报名。',
  },
  en: {
    bank: 'Bank',
    jersey1: 'Jersey colour (1)',
    jersey2: 'Jersey colour (2)',
    leaderZh: 'Leader name (Chinese)',
    leaderEn: 'Leader name (English)',
    leaderId: 'HKID prefix (letters + first 4 digits)',
    email: 'Email',
    mobile: 'Mobile',
    emergency: 'Emergency contact',
    players: 'Roster (optional now; up to 20 players)',
    playersOptional: 'You may add the roster after approval. If you enter players now, jersey numbers must be unique.',
    saveDraft: 'Save draft',
    draftSaved: 'Draft saved.',
    draftSaving: 'Saving…',
    localRestoreTitle: 'Load unsaved content?',
    localRestoreYes: 'Load',
    localRestoreNo: 'Discard',
    nextSteps:
      'Pay by crossed cheque (payable to Superlearning (Hong Kong) Limited). After confirmation, sign in and upload your roster under My teams.',
    nameZh: 'Name (Chinese)',
    nameEn: 'Name (English)',
    idPartial: 'HKID prefix',
    staffId: 'Staff card no. (optional)',
    jerseyNo: 'Jersey no.',
    addPlayer: 'Add player',
    declTitle: 'Leader declaration',
    declBank: 'Bank name (declaration)',
    declSign: 'Leader sign-off name',
    submit: 'Submit entry',
    submitting: 'Submitting…',
    successRef: 'Reference',
    successPay: 'Payment',
    validation: 'Please fix the highlighted fields.',
    offline: 'Online registration is not open yet. Email superlearninghkltd@gmail.com with the downloaded form.',
    closed: 'Registration has closed.',
    duplicate: 'You have already submitted a team entry for this competition.',
  },
};

type PlayerDraft = {
  number: number;
  nameZh: string;
  nameEn: string;
  idPartial: string;
  staffId: string;
  jerseyNumber: string;
};

type SavedPayload = {
  division: string;
  bank: string;
  jerseyColor1: string;
  jerseyColor2: string;
  leaderNameZh: string;
  leaderNameEn: string;
  leaderIdPartial: string;
  leaderEmail: string;
  leaderMobile: string;
  leaderEmergency: string;
  declarationBank: string;
  declarationSigned: string;
  declarations: boolean[];
  players: {
    number: number;
    nameZh: string;
    nameEn: string;
    idPartial: string;
    staffId?: string;
    jerseyNumber: number;
  }[];
};

const LOCAL_KEY = (slug: string) => `bnc-entry-autosave:${slug}`;

function emptyPlayers(count: number): PlayerDraft[] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    nameZh: '',
    nameEn: '',
    idPartial: '',
    staffId: '',
    jerseyNumber: String(i + 1 === 1 ? 4 : ''),
  }));
}

export default function TeamEntryRegisterForm({
  lang,
  slug,
  competition,
  offline,
}: {
  lang: Lang;
  slug: string;
  competition: Competition;
  offline: boolean;
}) {
  const ui = UI[lang];
  const declLines = DECLARATIONS[lang];
  const [players, setPlayers] = useState<PlayerDraft[]>(() => emptyPlayers(1));
  const [draftMsg, setDraftMsg] = useState('');
  const [draftBusy, setDraftBusy] = useState(false);
  const [localPrompt, setLocalPrompt] = useState<SavedPayload | null>(null);
  const hydrateDone = useRef(false);
  const [declarations, setDeclarations] = useState<boolean[]>([false, false, false, false, false]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ref: string; paymentNote: string } | null>(null);
  const [form, setForm] = useState({
    division: competition.category[lang],
    bank: '',
    jerseyColor1: '',
    jerseyColor2: '',
    leaderNameZh: '',
    leaderNameEn: '',
    leaderIdPartial: '',
    leaderEmail: '',
    leaderMobile: '',
    leaderEmergency: '',
    declarationBank: '',
    declarationSigned: '',
  });

  const errorClass = (key: string) => (fieldErrors[key] ? 'border-red-500' : '');

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePlayer = (index: number, key: keyof PlayerDraft, value: string) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [key]: value } : p))
    );
  };

  const addPlayer = () => {
    if (players.length >= 20) return;
    setPlayers((prev) => [
      ...prev,
      {
        number: prev.length + 1,
        nameZh: '',
        nameEn: '',
        idPartial: '',
        staffId: '',
        jerseyNumber: '',
      },
    ]);
  };

  const applyPayload = useCallback((data: SavedPayload) => {
    setForm({
      division: data.division,
      bank: data.bank,
      jerseyColor1: data.jerseyColor1,
      jerseyColor2: data.jerseyColor2,
      leaderNameZh: data.leaderNameZh,
      leaderNameEn: data.leaderNameEn,
      leaderIdPartial: data.leaderIdPartial,
      leaderEmail: data.leaderEmail,
      leaderMobile: data.leaderMobile,
      leaderEmergency: data.leaderEmergency,
      declarationBank: data.declarationBank,
      declarationSigned: data.declarationSigned,
    });
    if (data.players.length > 0) {
      setPlayers(
        data.players.map((p) => ({
          number: p.number,
          nameZh: p.nameZh,
          nameEn: p.nameEn,
          idPartial: p.idPartial,
          staffId: p.staffId ?? '',
          jerseyNumber: String(p.jerseyNumber),
        }))
      );
    }
    setDeclarations(data.declarations);
  }, []);

  const payload = useMemo(
    () => ({
      ...form,
      leaderIdPartial: form.leaderIdPartial.toUpperCase(),
      declarations,
      players: players
        .filter((p) => p.nameZh.trim() || p.nameEn.trim())
        .map((p) => ({
          number: p.number,
          nameZh: p.nameZh.trim(),
          nameEn: p.nameEn.trim(),
          idPartial: p.idPartial.trim().toUpperCase(),
          staffId: p.staffId.trim() || undefined,
          jerseyNumber: Number.parseInt(p.jerseyNumber, 10),
        })),
    }),
    [form, declarations, players]
  );

  useEffect(() => {
    if (hydrateDone.current || offline) return;
    hydrateDone.current = true;
    void (async () => {
      try {
        const res = await fetch(`/api/competitions/${slug}/draft`);
        if (res.ok) {
          const json = (await res.json()) as {
            draft?: {
              form: Record<string, string>;
              players: PlayerDraft[];
            } | null;
          };
          if (json.draft) {
            applyPayload({
              division: json.draft.form.division ?? competition.category[lang],
              bank: json.draft.form.bank ?? '',
              jerseyColor1: json.draft.form.jerseyColor1 ?? '',
              jerseyColor2: json.draft.form.jerseyColor2 ?? '',
              leaderNameZh: json.draft.form.leaderNameZh ?? '',
              leaderNameEn: json.draft.form.leaderNameEn ?? '',
              leaderIdPartial: json.draft.form.leaderIdPartial ?? '',
              leaderEmail: json.draft.form.leaderEmail ?? '',
              leaderMobile: json.draft.form.leaderMobile ?? '',
              leaderEmergency: json.draft.form.leaderEmergency ?? '',
              declarationBank: json.draft.form.declarationBank ?? '',
              declarationSigned: json.draft.form.declarationSigned ?? '',
              declarations: [false, false, false, false, false],
              players: json.draft.players.map((p) => ({
                number: p.number,
                nameZh: p.nameZh,
                nameEn: p.nameEn,
                idPartial: p.idPartial,
                staffId: p.staffId,
                jerseyNumber:
                  typeof p.jerseyNumber === 'number'
                    ? p.jerseyNumber
                    : Number.parseInt(String(p.jerseyNumber), 10) || 0,
              })),
            });
            return;
          }
        }
      } catch {
        /* ignore */
      }
      const raw = localStorage.getItem(LOCAL_KEY(slug));
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as SavedPayload;
        setLocalPrompt(parsed);
      } catch {
        localStorage.removeItem(LOCAL_KEY(slug));
      }
    })();
  }, [slug, offline, applyPayload, competition.category, lang]);

  useEffect(() => {
    if (offline) return;
    const id = setInterval(() => {
      try {
        localStorage.setItem(LOCAL_KEY(slug), JSON.stringify(payload));
      } catch {
        /* quota */
      }
    }, 5000);
    return () => clearInterval(id);
  }, [slug, payload, offline]);

  useEffect(() => {
    if (offline) return;
    try {
      localStorage.setItem(LOCAL_KEY(slug), JSON.stringify(payload));
    } catch {
      /* quota */
    }
  }, [payload, slug, offline]);

  const saveDraft = async () => {
    setDraftBusy(true);
    setDraftMsg('');
    setFieldErrors({});
    try {
      const res = await fetch(`/api/competitions/${slug}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { fields?: Record<string, string> };
      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields);
        return;
      }
      setDraftMsg(ui.draftSaved);
      localStorage.removeItem(LOCAL_KEY(slug));
    } catch {
      setFieldErrors({ form: ui.validation });
    } finally {
      setDraftBusy(false);
    }
  };

  if (offline) {
    return <p className="card text-sm text-red-600">{ui.offline}</p>;
  }

  if (result) {
    return (
      <div className="card space-y-3 text-sm">
        <p className="font-medium text-primary">
          {ui.successRef}：{result.ref}
        </p>
        <p>
          {ui.successPay}：{result.paymentNote}
        </p>
        <p className="text-gray-700">{ui.nextSteps}</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});
    try {
      const res = await fetch(`/api/competitions/${slug}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ref?: string;
        paymentNote?: string;
        fields?: Record<string, string>;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 409 && data.error === 'closed') {
          setFieldErrors({ form: ui.closed });
          return;
        }
        if (res.status === 409 && data.error === 'duplicate') {
          setFieldErrors({ form: ui.duplicate });
          return;
        }
        if (data.fields) setFieldErrors(data.fields);
        else setFieldErrors({ form: ui.validation });
        return;
      }
      if (data.ref) {
        localStorage.removeItem(LOCAL_KEY(slug));
        setResult({ ref: data.ref, paymentNote: data.paymentNote || competition.chequePayee[lang] });
      }
    } catch {
      setFieldErrors({ form: ui.validation });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {localPrompt ? (
        <div className="card text-sm flex flex-wrap gap-3 items-center justify-between">
          <span>{ui.localRestoreTitle}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="min-h-11 px-4 rounded-lg bg-orange text-white"
              onClick={() => {
                applyPayload(localPrompt);
                setLocalPrompt(null);
              }}
            >
              {ui.localRestoreYes}
            </button>
            <button
              type="button"
              className="min-h-11 px-4 rounded-lg border"
              onClick={() => {
                localStorage.removeItem(LOCAL_KEY(slug));
                setLocalPrompt(null);
              }}
            >
              {ui.localRestoreNo}
            </button>
          </div>
        </div>
      ) : null}
      {fieldErrors.form ? <p className="text-sm text-red-600">{fieldErrors.form}</p> : null}
      {draftMsg ? <p className="text-sm text-green-700">{draftMsg}</p> : null}
      <input type="hidden" name="division" value={form.division} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={ui.bank} error={fieldErrors.bank}>
          <input className={`input-field w-full ${errorClass('bank')}`} value={form.bank} onChange={(e) => updateForm('bank', e.target.value)} required />
        </Field>
        <Field label={competition.category[lang]}>
          <input className="input-field w-full bg-gray-50" readOnly value={form.division} />
        </Field>
        <Field label={ui.jersey1} error={fieldErrors.jerseyColor1}>
          <input className={`input-field w-full ${errorClass('jerseyColor1')}`} value={form.jerseyColor1} onChange={(e) => updateForm('jerseyColor1', e.target.value)} required />
        </Field>
        <Field label={ui.jersey2} error={fieldErrors.jerseyColor2}>
          <input className={`input-field w-full ${errorClass('jerseyColor2')}`} value={form.jerseyColor2} onChange={(e) => updateForm('jerseyColor2', e.target.value)} required />
        </Field>
      </div>

      <div className="card space-y-4">
        <Field label={ui.leaderZh} error={fieldErrors.leaderNameZh}>
          <input className={`input-field w-full ${errorClass('leaderNameZh')}`} value={form.leaderNameZh} onChange={(e) => updateForm('leaderNameZh', e.target.value)} required />
        </Field>
        <Field label={ui.leaderEn} error={fieldErrors.leaderNameEn}>
          <input className={`input-field w-full ${errorClass('leaderNameEn')}`} value={form.leaderNameEn} onChange={(e) => updateForm('leaderNameEn', e.target.value)} required />
        </Field>
        <Field label={ui.leaderId} error={fieldErrors.leaderIdPartial}>
          <input className={`input-field w-full uppercase ${errorClass('leaderIdPartial')}`} value={form.leaderIdPartial} onChange={(e) => updateForm('leaderIdPartial', e.target.value)} required pattern="[A-Za-z]{1,2}[0-9]{4}" />
        </Field>
        <Field label={ui.email} error={fieldErrors.leaderEmail}>
          <input className={`input-field w-full ${errorClass('leaderEmail')}`} type="email" value={form.leaderEmail} onChange={(e) => updateForm('leaderEmail', e.target.value)} required />
        </Field>
        <Field label={ui.mobile} error={fieldErrors.leaderMobile}>
          <input className={`input-field w-full ${errorClass('leaderMobile')}`} value={form.leaderMobile} onChange={(e) => updateForm('leaderMobile', e.target.value)} required />
        </Field>
        <Field label={ui.emergency} error={fieldErrors.leaderEmergency}>
          <input className={`input-field w-full ${errorClass('leaderEmergency')}`} value={form.leaderEmergency} onChange={(e) => updateForm('leaderEmergency', e.target.value)} required />
        </Field>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-primary">{ui.players}</h2>
        <p className="text-sm text-gray-600">{ui.playersOptional}</p>
        {fieldErrors.players ? <p className="text-sm text-red-600">{ui.validation}</p> : null}
        {players.map((p, index) => (
          <div key={p.number} className="card grid sm:grid-cols-2 gap-3 text-sm">
            <p className="sm:col-span-2 font-medium text-gray-600">#{p.number}{p.number === 1 ? ' (C)' : ''}</p>
            <Field label={ui.nameZh}>
              <input className="input-field w-full" value={p.nameZh} onChange={(e) => updatePlayer(index, 'nameZh', e.target.value)} />
            </Field>
            <Field label={ui.nameEn}>
              <input className="input-field w-full" value={p.nameEn} onChange={(e) => updatePlayer(index, 'nameEn', e.target.value)} />
            </Field>
            <Field label={ui.idPartial} error={fieldErrors[`players.${index}.idPartial`]}>
              <input className={`input-field w-full uppercase ${errorClass(`players.${index}.idPartial`)}`} value={p.idPartial} onChange={(e) => updatePlayer(index, 'idPartial', e.target.value)} />
            </Field>
            <Field label={ui.staffId}>
              <input className="input-field w-full" value={p.staffId} onChange={(e) => updatePlayer(index, 'staffId', e.target.value)} />
            </Field>
            <Field label={ui.jerseyNo} error={fieldErrors[`players.${index}.jerseyNumber`]}>
              <input className={`input-field w-full ${errorClass(`players.${index}.jerseyNumber`)}`} inputMode="numeric" value={p.jerseyNumber} onChange={(e) => updatePlayer(index, 'jerseyNumber', e.target.value)} />
            </Field>
          </div>
        ))}
        {players.length < 20 ? (
          <button type="button" className="text-sm text-orange" onClick={addPlayer}>
            + {ui.addPlayer}
          </button>
        ) : null}
      </section>

      <section className="card space-y-3">
        <h2 className="font-heading text-lg font-bold text-primary">{ui.declTitle}</h2>
        {declLines.map((line, i) => (
          <label key={line.slice(0, 16)} className="flex gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={declarations[i]}
              onChange={(e) => {
                setDeclarations((prev) => {
                  const next = [...prev];
                  next[i] = e.target.checked;
                  return next;
                });
              }}
            />
            <span>{line}</span>
          </label>
        ))}
        {fieldErrors.declarations ? <p className="text-sm text-red-600">{ui.validation}</p> : null}
        <Field label={ui.declBank} error={fieldErrors.declarationBank}>
          <input className={`input-field w-full ${errorClass('declarationBank')}`} value={form.declarationBank} onChange={(e) => updateForm('declarationBank', e.target.value)} required />
        </Field>
        <Field label={ui.declSign} error={fieldErrors.declarationSigned}>
          <input className={`input-field w-full ${errorClass('declarationSigned')}`} value={form.declarationSigned} onChange={(e) => updateForm('declarationSigned', e.target.value)} required />
        </Field>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary min-h-11" disabled={pending}>
          {pending ? ui.submitting : ui.submit}
        </button>
        <button
          type="button"
          className="min-h-11 px-6 rounded-lg border border-gray-300 bg-white text-primary font-medium"
          disabled={draftBusy || pending}
          onClick={() => void saveDraft()}
        >
          {draftBusy ? ui.draftSaving : ui.saveDraft}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-primary">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600" role="alert">!</span> : null}
    </label>
  );
}
