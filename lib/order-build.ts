import { getProduct, SHOP_PRODUCTS } from '@/lib/shop-catalog';
import type { Lang } from '@/types';
import { clip, hasAtLeastDigits, makeRef } from '@/lib/codes';

export interface CheckoutLineInput {
  slug: string;
  qty: number;
  size?: string;
  color?: string;
  teamName?: string;
}

export function buildOrder(body: {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  note?: unknown;
  lines?: CheckoutLineInput[];
  lang?: Lang;
}) {
  const name = clip(body.name, 80);
  const phone = clip(body.phone, 40);
  const email = clip(body.email, 120);
  const note = clip(body.note, 400);
  const lang: Lang = body.lang === 'en' || body.lang === 'zh-cn' ? body.lang : 'zh-hk';

  if (name.length < 2 || !hasAtLeastDigits(phone, 6)) {
    return { error: 'invalid_contact' as const };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'invalid_email' as const };
  }
  if (!Array.isArray(body.lines) || body.lines.length === 0 || body.lines.length > 30) {
    return { error: 'empty_cart' as const };
  }

  const lines = [];
  for (const line of body.lines) {
    const product = getProduct(String(line.slug || ''));
    if (!product) return { error: 'unknown_product' as const };
    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) return { error: 'invalid_qty' as const };
    const size = clip(line.size, 12);
    const color = clip(line.color, 20);
    const teamName = clip(line.teamName, 24);
    if (product.sizes.length > 0 && !product.sizes.includes(size)) return { error: 'invalid_size' as const };
    if (product.colors.length > 0 && !product.colors.some((item) => item.id === color)) {
      return { error: 'invalid_color' as const };
    }
    lines.push({
      slug: product.slug,
      name: product.name[lang],
      qty,
      size,
      color: product.colors.find((item) => item.id === color)?.label[lang] || '',
      teamName: product.teamName ? teamName : '',
      samplePriceHkd: product.samplePriceHkd,
    });
  }

  const known = new Set(SHOP_PRODUCTS.map((product) => product.slug));
  if (lines.some((line) => !known.has(line.slug))) return { error: 'unknown_product' as const };

  return {
    order: {
      ref: makeRef('BNC-S'),
      createdAt: new Date().toISOString(),
      name,
      phone,
      email,
      note,
      lines,
      sampleTotalHkd: lines.reduce((sum, line) => sum + line.samplePriceHkd * line.qty, 0),
      status: 'mock_unpaid' as const,
    },
  };
}
