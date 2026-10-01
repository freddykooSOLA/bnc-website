'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Lang } from '@/types';
import { SECTION_COPY } from '@/lib/section-copy';
import { clearCart, readCart, type CartLine } from '@/lib/cart-client';

export default function CheckoutForm({ lang }: { lang: Lang }) {
  const copy = SECTION_COPY[lang];
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLines(readCart());
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, note, lines, lang }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || copy.required);
        return;
      }
      clearCart();
      router.push(`/${lang}/shop/order/${data.order.ref}`);
    } catch {
      setError(copy.required);
    } finally {
      setPending(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="card">
        <p className="mb-4">{copy.emptyCart}</p>
        <Link href={`/${lang}/shop`} className="btn-primary">
          {copy.continueShop}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 max-w-xl">
      <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-900">
        {copy.mockPay}
      </p>
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
        <span className="mt-1 block text-xs text-gray-500">{copy.contactOptional}</span>
      </label>
      <label className="block text-sm">
        <span className="font-medium text-primary">{copy.note}</span>
        <textarea value={note} maxLength={400} onChange={(event) => setNote(event.target.value)} className="input-field mt-1" rows={3} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {copy.placeOrder}
      </button>
    </form>
  );
}
