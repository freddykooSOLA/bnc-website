'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lang } from '@/types';
import type { ShopProduct } from '@/lib/shop-catalog';
import { samplePriceLabel } from '@/lib/shop-catalog';
import { SECTION_COPY } from '@/lib/section-copy';
import { addLine } from '@/lib/cart-client';

export default function AddToCartForm({
  lang,
  product,
}: {
  lang: Lang;
  product: ShopProduct;
}) {
  const copy = SECTION_COPY[lang];
  const router = useRouter();
  const [size, setSize] = useState(product.sizes[0] || '');
  const [color, setColor] = useState(product.colors[0]?.id || '');
  const [teamName, setTeamName] = useState('');
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    addLine({
      slug: product.slug,
      qty,
      size,
      color,
      teamName: teamName.trim(),
    });
    setMessage(copy.addToCart);
    router.push(`/${lang}/shop/cart`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm font-semibold text-orange">{copy.pricePending}</p>
      <p className="font-heading text-2xl font-bold text-primary">
        {samplePriceLabel(lang, product.samplePriceHkd)}
      </p>
      <p className="text-sm text-gray-500">{copy.stockUnset}</p>

      {product.sizes.length > 0 && (
        <label className="block text-sm">
          <span className="font-medium text-primary">{copy.size}</span>
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="input-field mt-1"
          >
            {product.sizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}

      {product.colors.length > 0 && (
        <label className="block text-sm">
          <span className="font-medium text-primary">{copy.color}</span>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="input-field mt-1"
          >
            {product.colors.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label[lang]}
              </option>
            ))}
          </select>
        </label>
      )}

      {product.teamName && (
        <label className="block text-sm">
          <span className="font-medium text-primary">{copy.teamName}</span>
          <input
            value={teamName}
            maxLength={24}
            onChange={(event) => setTeamName(event.target.value)}
            className="input-field mt-1"
          />
          <span className="mt-1 block text-xs text-gray-500">{copy.teamNameHint}</span>
        </label>
      )}

      <label className="block text-sm">
        <span className="font-medium text-primary">{copy.qty}</span>
        <input
          type="number"
          min={1}
          max={20}
          value={qty}
          onChange={(event) => setQty(Number(event.target.value))}
          className="input-field mt-1 w-28"
        />
      </label>

      <button type="submit" className="btn-primary">
        {copy.addToCart}
      </button>
      {message && <p className="text-sm text-primary">{message}</p>}
    </form>
  );
}
