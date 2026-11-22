import { randomBytes } from 'crypto';
import { ID_PARTIAL_RE } from '@/lib/competition-entry-validation';
import { rosterEditAccess } from '@/lib/roster-access';
import { databaseEnabled, prisma } from '@/lib/prisma';

export interface RosterPlayerInput {
  nameZh: string;
  nameEn: string;
  idPartial: string;
  staffId?: string;
  jerseyNumber: number;
  isCaptain?: boolean;
}

export type RosterFieldErrors = Record<string, string>;

export function generateInviteToken(): string {
  return randomBytes(24).toString('base64url');
}

export function rosterDeadlinePassed(rosterBy: Date): boolean {
  return Date.now() > rosterBy.getTime();
}

export async function assertLeaderOwnsTeam(teamId: string, memberId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team || team.createdById !== memberId) {
    throw new Error('forbidden');
  }
  return team;
}

export async function getTeamRosterContext(teamId: string, memberId: string) {
  await assertLeaderOwnsTeam(teamId, memberId);
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      memberships: { orderBy: { jerseyNumber: 'asc' } },
      entries: {
        include: { competition: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!team) throw new Error('not_found');
  const entry = team.entries[0] ?? null;
  const rosterBy = entry?.competition.rosterBy ?? null;
  const access = rosterEditAccess(entry, rosterBy);
  return { team, entry, rosterBy, editable: access.editable, lockReason: access.reason, statusLabel: access.statusLabel };
}

export function validateRosterPlayer(
  input: RosterPlayerInput,
  existingJerseys: Set<number>,
  opts?: { skipJersey?: number }
): { ok: true; value: RosterPlayerInput } | { ok: false; errors: RosterFieldErrors } {
  const errors: RosterFieldErrors = {};
  const nameZh = input.nameZh.trim();
  const nameEn = input.nameEn.trim();
  const idPartial = input.idPartial.trim().toUpperCase();
  const jerseyNumber = input.jerseyNumber;

  if (!nameZh && !nameEn) errors.name = 'required';
  if (!idPartial) errors.idPartial = 'required';
  else if (!ID_PARTIAL_RE.test(idPartial)) errors.idPartial = 'format';
  if (!Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
    errors.jerseyNumber = 'range';
  } else if (existingJerseys.has(jerseyNumber) && opts?.skipJersey !== jerseyNumber) {
    errors.jerseyNumber = 'duplicate';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      nameZh,
      nameEn,
      idPartial,
      staffId: input.staffId?.trim() || undefined,
      jerseyNumber,
      isCaptain: input.isCaptain,
    },
  };
}

export function validateRosterCount(count: number): boolean {
  return count >= 5 && count <= 20;
}

export async function ensureRosterEditable(teamId: string, memberId: string) {
  const ctx = await getTeamRosterContext(teamId, memberId);
  if (!ctx.editable) throw new Error('roster_locked');
  return ctx;
}

export function rosterEnabled(): boolean {
  return databaseEnabled();
}

export async function findMembershipByToken(token: string) {
  if (!token || token.length < 16) return null;
  return prisma.teamMembership.findFirst({
    where: { inviteToken: token },
    include: {
      team: {
        include: {
          entries: { include: { competition: true }, take: 1 },
        },
      },
    },
  });
}