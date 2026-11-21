import { databaseEnabled, prisma } from '@/lib/prisma';
import { findMemberByEmailInStore, upsertMemberFromOAuth } from '@/lib/users';

export type OAuthProvider = 'google' | 'facebook';

export interface OAuthSignInPayload {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  displayName: string;
  image?: string;
}

/** Google 會員沿用 Google `sub`；Facebook 新帳號用 `fb:<id>`。 */
export function memberIdForNewOAuthUser(provider: OAuthProvider, providerAccountId: string): string {
  if (provider === 'google') return providerAccountId;
  if (provider === 'facebook') return `fb:${providerAccountId}`;
  return `${provider}:${providerAccountId}`;
}

async function linkIdentityIfDatabase(
  memberId: string,
  provider: string,
  providerAccountId: string
) {
  if (!databaseEnabled()) return;
  try {
    await prisma.memberIdentity.upsert({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      create: { memberId, provider, providerAccountId },
      update: { memberId },
    });
  } catch {
    // Schema may not be migrated yet (B1 commit 3); blob path still works.
  }
}

async function resolveMemberIdFromDatabase(
  provider: OAuthProvider,
  providerAccountId: string,
  email: string
): Promise<string | null> {
  if (!databaseEnabled()) return null;
  try {
    const identity = await prisma.memberIdentity.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });
    if (identity) return identity.memberId;

    const byEmail = await prisma.member.findFirst({ where: { email } });
    if (byEmail) {
      await linkIdentityIfDatabase(byEmail.id, provider, providerAccountId);
      return byEmail.id;
    }
  } catch {
    return null;
  }
  return null;
}

/** 登入後決定 session 使用的 Member.id（保留舊 Google id）。 */
export async function resolveAndUpsertOAuthMember(
  payload: OAuthSignInPayload
): Promise<string> {
  const fromDb = await resolveMemberIdFromDatabase(
    payload.provider,
    payload.providerAccountId,
    payload.email
  );

  let memberId = fromDb;
  if (!memberId) {
    const emailMatch = await findMemberByEmailInStore(payload.email);
    if (emailMatch) {
      memberId = emailMatch.id;
    } else {
      memberId = memberIdForNewOAuthUser(payload.provider, payload.providerAccountId);
    }
  }

  await upsertMemberFromOAuth({
    id: memberId,
    email: payload.email,
    displayName: payload.displayName,
    image: payload.image,
  });

  await linkIdentityIfDatabase(memberId, payload.provider, payload.providerAccountId);

  return memberId;
}