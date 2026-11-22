import assert from 'node:assert/strict';
import { validateTeamBlobMediaUrl } from '../lib/team-blob-media-url';

const teamId = 'team-abc';
const membershipId = 'mem-xyz';
const host = 'https://abcdef123.public.blob.vercel-storage.com';

{
  const url = `${host}/bnc/teams/${teamId}/logo-123456-abc.webp`;
  const r = validateTeamBlobMediaUrl(url, 'logo', teamId);
  assert.equal(r.ok, true);
}

{
  const url = `${host}/bnc/teams/${teamId}/players/${membershipId}-99-photo.jpg`;
  const r = validateTeamBlobMediaUrl(url, 'photo', teamId, membershipId);
  assert.equal(r.ok, true);
}

{
  const url = `${host}/bnc/teams/${teamId}/logo-x.png`;
  const r = validateTeamBlobMediaUrl(url, 'logo', 'other-team');
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'wrong_path');
}

{
  const url = `http://evil.com/bnc/teams/${teamId}/logo-x.png`;
  const r = validateTeamBlobMediaUrl(url, 'logo', teamId);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'not_https');
}

{
  const url = `https://cdn.example.com/bnc/teams/${teamId}/logo-x.png`;
  const r = validateTeamBlobMediaUrl(url, 'logo', teamId);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'wrong_host');
}

{
  const url = `${host}/bnc/teams/${teamId}/players/wrong-mem-1.png`;
  const r = validateTeamBlobMediaUrl(url, 'photo', teamId, membershipId);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, 'wrong_path');
}

console.log('team-blob-media-url tests OK');