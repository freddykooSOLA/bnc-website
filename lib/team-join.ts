import { MemberRoleType } from '@prisma/client';
import { findMembershipByToken } from '@/lib/team-roster';
import { databaseEnabled, prisma } from '@/lib/prisma';

export async function claimInviteToken(token: string, memberId: string) {
  const membership = await findMembershipByToken(token);
  if (!membership) {
    return { ok: false as const, reason: 'invalid' as const };
  }
  if (membership.memberId) {
    return { ok: false as const, reason: 'taken' as const };
  }
  if (!membership.inviteToken || membership.inviteToken !== token) {
    return { ok: false as const, reason: 'invalid' as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.teamMembership.update({
      where: { id: membership.id },
      data: {
        memberId,
        status: 'joined',
        inviteToken: null,
      },
    });
    await tx.memberRole.upsert({
      where: {
        memberId_role: { memberId, role: MemberRoleType.PLAYER },
      },
      create: { memberId, role: MemberRoleType.PLAYER },
      update: {},
    });
  });

  return {
    ok: true as const,
    teamName: membership.team.name,
    playerName: membership.nameZh || membership.nameEn,
  };
}

export function joinEnabled(): boolean {
  return databaseEnabled();
}