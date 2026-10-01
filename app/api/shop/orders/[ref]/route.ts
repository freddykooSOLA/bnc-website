import { NextResponse } from 'next/server';
import { findOrder } from '@/lib/ledger';
import { isRef } from '@/lib/codes';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { ref: string } }
) {
  const ref = params.ref.toUpperCase();
  if (!isRef(ref, 'BNC-S')) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const order = await findOrder(ref);
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    order: {
      ref: order.ref,
      createdAt: order.createdAt,
      name: order.name,
      lines: order.lines,
      sampleTotalHkd: order.sampleTotalHkd,
      status: order.status,
      note: order.note,
    },
  });
}
