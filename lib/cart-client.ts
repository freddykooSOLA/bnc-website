export interface CartLine {
  slug: string;
  qty: number;
  size: string;
  color: string;
  teamName: string;
}

const KEY = 'bnc-shop-cart';

export function readCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event('bnc-cart'));
}

function sameLine(a: CartLine, b: CartLine) {
  return a.slug === b.slug && a.size === b.size && a.color === b.color && a.teamName === b.teamName;
}

export function addLine(line: CartLine) {
  const cart = readCart();
  const existing = cart.find((item) => sameLine(item, line));
  if (existing) {
    existing.qty = Math.min(20, existing.qty + line.qty);
  } else {
    cart.push({ ...line, qty: Math.min(20, Math.max(1, line.qty || 1)) });
  }
  writeCart(cart);
}

export function updateQty(index: number, qty: number) {
  const cart = readCart();
  if (!cart[index]) return;
  cart[index].qty = Math.min(20, Math.max(1, qty));
  writeCart(cart);
}

export function removeLine(index: number) {
  const cart = readCart();
  cart.splice(index, 1);
  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}
