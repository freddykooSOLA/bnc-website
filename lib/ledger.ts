import { get, put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_PATH = 'bnc/ledger.json';
const FILE_PATH = path.join(process.cwd(), 'data', 'runtime', 'ledger.json');
const MAX_ROWS = 2000;

export interface OrderLine {
  slug: string;
  name: string;
  qty: number;
  size: string;
  color: string;
  teamName: string;
  samplePriceHkd: number;
}

export interface ShopOrder {
  ref: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  note: string;
  lines: OrderLine[];
  sampleTotalHkd: number;
  status: 'mock_unpaid';
}

export interface EventRegistration {
  ref: string;
  eventSlug: string;
  eventTitle: string;
  name: string;
  phone: string;
  email: string;
  team: string;
  needsJersey: string;
  createdAt: string;
  checkedInAt: string | null;
}

interface Ledger {
  orders: ShopOrder[];
  registrations: EventRegistration[];
}

function emptyLedger(): Ledger {
  return { orders: [], registrations: [] };
}

function normalize(raw: unknown): Ledger {
  const data = raw && typeof raw === 'object' ? (raw as Partial<Ledger>) : {};
  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    registrations: Array.isArray(data.registrations) ? data.registrations : [],
  };
}

async function readBlob(): Promise<{ ledger: Ledger; etag: string | null }> {
  const result = await get(BLOB_PATH, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return { ledger: emptyLedger(), etag: null };
  }
  const text = await new Response(result.stream).text();
  return { ledger: normalize(JSON.parse(text)), etag: result.blob.etag || null };
}

async function writeBlob(ledger: Ledger) {
  await put(BLOB_PATH, JSON.stringify(ledger), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

function readFile(): Ledger {
  if (!fs.existsSync(FILE_PATH)) return emptyLedger();
  return normalize(JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')));
}

function writeFile(ledger: Ledger) {
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(ledger, null, 2), 'utf-8');
}

function usesBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

let queue: Promise<void> = Promise.resolve();

async function mutate<T>(fn: (ledger: Ledger) => T): Promise<T> {
  const run = async () => {
    if (!usesBlob()) {
      const ledger = readFile();
      const result = fn(ledger);
      ledger.orders = ledger.orders.slice(0, MAX_ROWS);
      ledger.registrations = ledger.registrations.slice(0, MAX_ROWS);
      writeFile(ledger);
      return result;
    }

    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const { ledger } = await readBlob();
        const result = fn(ledger);
        ledger.orders = ledger.orders.slice(0, MAX_ROWS);
        ledger.registrations = ledger.registrations.slice(0, MAX_ROWS);
        await writeBlob(ledger);
        return result;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  const result = queue.then(run, run);
  queue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export async function saveOrder(order: ShopOrder) {
  return mutate((ledger) => {
    ledger.orders.unshift(order);
    return order;
  });
}

export async function findOrder(ref: string) {
  if (!usesBlob()) {
    return readFile().orders.find((order) => order.ref === ref) || null;
  }
  const { ledger } = await readBlob();
  return ledger.orders.find((order) => order.ref === ref) || null;
}

export async function countRegistrationsForEvent(eventSlug: string) {
  const rows = usesBlob()
    ? (await readBlob()).ledger.registrations
    : readFile().registrations;
  return rows.filter((row) => row.eventSlug === eventSlug).length;
}

export type SaveRegistrationResult =
  | { ok: true; registration: EventRegistration }
  | { ok: false; error: 'event_full' };

export async function saveRegistration(
  registration: EventRegistration,
  options?: { capacity?: number }
): Promise<SaveRegistrationResult> {
  const capacity = options?.capacity;
  return mutate((ledger): SaveRegistrationResult => {
    if (capacity != null && capacity >= 0) {
      const count = ledger.registrations.filter((row) => row.eventSlug === registration.eventSlug).length;
      if (count >= capacity) {
        return { ok: false, error: 'event_full' };
      }
    }
    ledger.registrations.unshift(registration);
    return { ok: true, registration };
  });
}

export async function findRegistration(ref: string) {
  if (!usesBlob()) {
    return readFile().registrations.find((row) => row.ref === ref) || null;
  }
  const { ledger } = await readBlob();
  return ledger.registrations.find((row) => row.ref === ref) || null;
}

export async function searchRegistrations(query: string) {
  const needle = query.trim().toLowerCase();
  const rows = usesBlob()
    ? (await readBlob()).ledger.registrations
    : readFile().registrations;
  if (!needle) return rows.slice(0, 50);
  return rows
    .filter((row) =>
      [row.ref, row.name, row.phone, row.team, row.eventTitle]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    )
    .slice(0, 50);
}

export async function checkIn(ref: string) {
  return mutate((ledger) => {
    const row = ledger.registrations.find((item) => item.ref === ref);
    if (!row) return null;
    if (!row.checkedInAt) row.checkedInAt = new Date().toISOString();
    return row;
  });
}
