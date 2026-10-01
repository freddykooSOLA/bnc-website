'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Lang } from '@/types';
import { SECTION_COPY } from '@/lib/section-copy';
import { getProduct, samplePriceLabel } from '@/lib/shop-catalog';
import { readCart, removeLine, updateQty, type CartLine } from '@/lib/cart-client';

export default function CartView({ lang }: { lang: Lang }) {
  const copy = SECTION_COPY[lang];
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const sync = () => setLines(readCart());
    sync();
    window.addEventListener('bnc-cart', sync);
    return () => window.removeEventListener('bnc-cart', sync);
  }, []);

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
    <div className="space-y-4">
      {lines.map((line, index) => {
        const product = getProduct(line.slug);
        const color = product?.colors.find((item) => item.id === line.color);
        return (
          <div key={`${line.slug}-${index}`} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-primary">{product ? product.name[lang] : line.slug}</p>
              <p className="text-sm text-gray-500">
                {[line.size, color?.label[lang], line.teamName].filter(Boolean).join(' · ')}
              </p>
              <p className="text-sm text-orange">{copy.pricePending}</p>
              {product && (
                <p className="text-sm">{samplePriceLabel(lang, product.samplePriceHkd)}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={20}
                value={line.qty}
                onChange={(event) => updateQty(index, Number(event.target.value))}
                className="input-field w-20"
              />
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-primary"
                onClick={() => removeLine(index)}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <Link href={`/${lang}/shop/checkout`} className="btn-primary">
        {copy.checkout}
      </Link>
    </div>
  );
}
