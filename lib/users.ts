import { syncMemberToDatabase } from '@/lib/db-sync';
import { get, put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_PATH = 'bnc/users.json';
const FILE_PATH = path.join(process.cwd(), 'data', 'runtime', 'users.json');
const MAX_USERS = 5000;

export interface MemberUser {
  id: string;
  email: string;
  displayName: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStore {
  users: MemberUser[];
}

function emptyStore(): UserStore {
  return { users: [] };
}

function normalize(raw: unknown): UserStore {
  const data = raw && typeof raw === 'object' ? (raw as Partial<UserStore>) : {};
  return {
    users: Array.isArray(data.users) ? data.users : [],
  };
}

function usesBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readBlob(): Promise<UserStore> {
  const result = await get(BLOB_PATH, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return emptyStore();
  }
  const text = await new Response(result.stream).text();
  return normalize(JSON.parse(text));
}

async function writeBlob(store: UserStore) {
  await put(BLOB_PATH, JSON.stringify(store), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

function readFile(): UserStore {
  if (!fs.existsSync(FILE_PATH)) return emptyStore();
  return normalize(JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')));
}

function writeFile(store: UserStore) {
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
  fs.writeFileSync(FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

let queue: Promise<void> = Promise.resolve();

async function mutate<T>(fn: (store: UserStore) => T): Promise<T> {
  const run = async () => {
    if (!usesBlob()) {
      const store = readFile();
      const result = fn(store);
      store.users = store.users.slice(0, MAX_USERS);
      writeFile(store);
      return result;
    }

    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const store = await readBlob();
        const result = fn(store);
        store.users = store.users.slice(0, MAX_USERS);
        await writeBlob(store);
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

export interface OAuthMemberInput {
  id: string;
  email: string;
  displayName: string;
  image?: string;
}

/** 首次 Google 登入建立會員；之後更新顯示名稱與頭像。 */
export async function upsertMemberFromOAuth(input: OAuthMemberInput): Promise<MemberUser> {
  const now = new Date().toISOString();
  const user = await mutate((store) => {
    const existing = store.users.find((u) => u.id === input.id);
    if (existing) {
      existing.email = input.email;
      existing.displayName = input.displayName;
      if (input.image) existing.image = input.image;
      existing.updatedAt = now;
      return existing;
    }
    const user: MemberUser = {
      id: input.id,
      email: input.email,
      displayName: input.displayName,
      image: input.image,
      createdAt: now,
      updatedAt: now,
    };
    store.users.unshift(user);
    return user;
  });
  await syncMemberToDatabase(user);
  return user;
}

export async function findMemberById(id: string): Promise<MemberUser | null> {
  const store = usesBlob() ? await readBlob() : readFile();
  return store.users.find((u) => u.id === id) || null;
}
