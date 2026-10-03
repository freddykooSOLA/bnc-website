'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lang } from '@/types';
import { SECTION_COPY } from '@/lib/section-copy';

export default function EventRegisterForm({ lang, slug }: { lang: Lang; slug: string }) {
  const copy = SECTION_COPY[lang];
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, phone, email, team, lang }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error === 'registration_closed' ? copy.registrationClosed : copy.required);
        return;
      }
      router.push(`/${lang}/events/ticket/${data.registration.ref}`);
    } catch {
      setError(copy.required);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <h2 className="font-heading text-xl font-bold text-primary">{copy.register}</h2>
      <label className="block text-sm">
        <span className="font-medium text-primary">{copy.name}</span>
        <input required value={name} onChange={(event) => setName(event.target.value)} className="input-field mt-1" />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-primary">{copy.phone}</span>
        <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="input-field mt-1" />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-primary">{copy.email}</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-field mt-1" />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-primary">{copy.team}</span>
        <input required value={team} onChange={(event) => setTeam(event.target.value)} className="input-field mt-1" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {copy.register}
      </button>
    </form>
  );
}
