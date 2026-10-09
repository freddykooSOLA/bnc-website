/**
 * One-time import: Vercel Blob (or local runtime JSON) → Postgres.
 * Always backs up raw JSON under data/runtime/backups/bnc010-<timestamp>/ before import.
 *
 * Usage:
 *   DATABASE_URL=... BLOB_READ_WRITE_TOKEN=... node scripts/migrate-blob-to-postgres.mjs
 * Rollback (destructive — only BNC tables in this schema):
 *   node scripts/migrate-blob-to-postgres.mjs --rollback
 */
import { get } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const USERS_BLOB = 'bnc/users.json';
const LEDGER_BLOB = 'bnc/ledger.json';
const RUNTIME_DIR = path.join(process.cwd(), 'data', 'runtime');

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function readJsonBlob(blobPath) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const result = await get(blobPath, { access: 'private', useCache: false });
    if (!result?.stream) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  }
  const localName = blobPath.endsWith('users.json') ? 'users.json' : 'ledger.json';
  const file = path.join(RUNTIME_DIR, localName);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function backupJson(label, data) {
  const dir = path.join(RUNTIME_DIR, 'backups', `bnc010-${stamp()}`);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, label);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[backup] wrote ${file}`);
  return dir;
}

async function importAll(prisma) {
  const usersRaw = await readJsonBlob(USERS_BLOB);
  const ledgerRaw = await readJsonBlob(LEDGER_BLOB);

  if (usersRaw) backupJson('users.json', usersRaw);
  if (ledgerRaw) backupJson('ledger.json', ledgerRaw);

  const users = Array.isArray(usersRaw?.users) ? usersRaw.users : [];
  const registrations = Array.isArray(ledgerRaw?.registrations) ? ledgerRaw.registrations : [];
  const orders = Array.isArray(ledgerRaw?.orders) ? ledgerRaw.orders : [];

  let memberCount = 0;
  for (const u of users) {
    if (!u?.id) continue;
    await prisma.member.upsert({
      where: { id: String(u.id) },
      create: {
        id: String(u.id),
        email: String(u.email || ''),
        displayName: String(u.displayName || ''),
        image: u.image ? String(u.image) : null,
        createdAt: new Date(u.createdAt || Date.now()),
        updatedAt: new Date(u.updatedAt || u.createdAt || Date.now()),
      },
      update: {
        email: String(u.email || ''),
        displayName: String(u.displayName || ''),
        image: u.image ? String(u.image) : null,
        updatedAt: new Date(u.updatedAt || Date.now()),
      },
    });
    memberCount += 1;
  }

  let regCount = 0;
  for (const r of registrations) {
    if (!r?.ref) continue;
    await prisma.eventRegistration.upsert({
      where: { ref: String(r.ref) },
      create: {
        ref: String(r.ref),
        eventSlug: String(r.eventSlug || ''),
        eventTitle: String(r.eventTitle || ''),
        name: String(r.name || ''),
        phone: String(r.phone || ''),
        email: String(r.email || ''),
        team: String(r.team || ''),
        needsJersey: String(r.needsJersey || ''),
        createdAt: new Date(r.createdAt || Date.now()),
        checkedInAt: r.checkedInAt ? new Date(r.checkedInAt) : null,
      },
      update: {
        eventSlug: String(r.eventSlug || ''),
        eventTitle: String(r.eventTitle || ''),
        name: String(r.name || ''),
        phone: String(r.phone || ''),
        email: String(r.email || ''),
        team: String(r.team || ''),
        needsJersey: String(r.needsJersey || ''),
        checkedInAt: r.checkedInAt ? new Date(r.checkedInAt) : null,
      },
    });
    regCount += 1;
  }

  let orderCount = 0;
  for (const o of orders) {
    if (!o?.ref) continue;
    await prisma.shopOrder.upsert({
      where: { ref: String(o.ref) },
      create: {
        ref: String(o.ref),
        createdAt: new Date(o.createdAt || Date.now()),
        name: String(o.name || ''),
        phone: String(o.phone || ''),
        email: String(o.email || ''),
        note: String(o.note || ''),
        linesJson: JSON.stringify(o.lines || []),
        sampleTotalHkd: Number(o.sampleTotalHkd || 0),
        status: String(o.status || 'mock_unpaid'),
      },
      update: {
        name: String(o.name || ''),
        phone: String(o.phone || ''),
        email: String(o.email || ''),
        note: String(o.note || ''),
        linesJson: JSON.stringify(o.lines || []),
        sampleTotalHkd: Number(o.sampleTotalHkd || 0),
        status: String(o.status || 'mock_unpaid'),
      },
    });
    orderCount += 1;
  }

  console.log(
    JSON.stringify({ members: memberCount, registrations: regCount, orders: orderCount }, null, 2)
  );
}

async function rollback(prisma) {
  await prisma.$transaction([
    prisma.voucherRedemption.deleteMany(),
    prisma.voucherShare.deleteMany(),
    prisma.voucher.deleteMany(),
    prisma.voucherType.deleteMany(),
    prisma.pointLedger.deleteMany(),
    prisma.partnerMerchant.deleteMany(),
    prisma.eventRegistration.deleteMany(),
    prisma.shopOrder.deleteMany(),
    prisma.member.deleteMany(),
  ]);
  console.log('[rollback] cleared BNC prisma tables');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    if (process.argv.includes('--rollback')) {
      await rollback(prisma);
    } else {
      await importAll(prisma);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
