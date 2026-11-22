export type TeamBlobMediaKind = 'logo' | 'photo';

const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

export function validateTeamBlobMediaUrl(
  url: string,
  kind: TeamBlobMediaKind,
  teamId: string,
  membershipId?: string
): { ok: true } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: 'not_https' };
  }

  if (!parsed.hostname.endsWith(BLOB_HOST_SUFFIX)) {
    return { ok: false, reason: 'wrong_host' };
  }

  const path = parsed.pathname;
  if (kind === 'logo') {
    const prefix = `/bnc/teams/${teamId}/logo-`;
    if (!path.startsWith(prefix)) {
      return { ok: false, reason: 'wrong_path' };
    }
    return { ok: true };
  }

  if (!membershipId) {
    return { ok: false, reason: 'missing_membership' };
  }
  const prefix = `/bnc/teams/${teamId}/players/${membershipId}-`;
  if (!path.startsWith(prefix)) {
    return { ok: false, reason: 'wrong_path' };
  }
  return { ok: true };
}