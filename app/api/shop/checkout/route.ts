import { NextResponse } from 'next/server';
import { buildOrder } from '@/lib/order-build';
import { saveOrder } from '@/lib/ledger';

export const dynamic = 'force-dynamic';

/** 示範結帳：重新計算示例售價並記下訂單，不呼叫任何支付。 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const built = buildOrder(body as Parameters<typeof buildOrder>[0]);
  if ('error' in built) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  try {
    const order = await saveOrder(built.order);
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'store_unavailable' }, { status: 503 });
  }
}
