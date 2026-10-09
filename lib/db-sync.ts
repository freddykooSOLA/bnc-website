import type { EventRegistration, ShopOrder } from '@/lib/ledger';
import type { MemberUser } from '@/lib/users';
import { databaseEnabled, prisma } from '@/lib/prisma';

function logDbSyncError(context: string, error: unknown) {
  console.error(`[db-sync] ${context}`, error);
}

export async function syncMemberToDatabase(user: MemberUser) {
  if (!databaseEnabled()) return;
  try {
    await prisma.member.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        image: user.image ?? null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
      update: {
        email: user.email,
        displayName: user.displayName,
        image: user.image ?? null,
        updatedAt: new Date(user.updatedAt),
      },
    });
  } catch (error) {
    logDbSyncError('syncMemberToDatabase', error);
  }
}

export async function syncRegistrationToDatabase(registration: EventRegistration) {
  if (!databaseEnabled()) return;
  try {
    await prisma.eventRegistration.upsert({
      where: { ref: registration.ref },
      create: {
        ref: registration.ref,
        eventSlug: registration.eventSlug,
        eventTitle: registration.eventTitle,
        name: registration.name,
        phone: registration.phone,
        email: registration.email,
        team: registration.team,
        needsJersey: registration.needsJersey,
        createdAt: new Date(registration.createdAt),
        checkedInAt: registration.checkedInAt ? new Date(registration.checkedInAt) : null,
      },
      update: {
        eventSlug: registration.eventSlug,
        eventTitle: registration.eventTitle,
        name: registration.name,
        phone: registration.phone,
        email: registration.email,
        team: registration.team,
        needsJersey: registration.needsJersey,
        checkedInAt: registration.checkedInAt ? new Date(registration.checkedInAt) : null,
      },
    });
  } catch (error) {
    logDbSyncError('syncRegistrationToDatabase', error);
  }
}

export async function syncShopOrderToDatabase(order: ShopOrder) {
  if (!databaseEnabled()) return;
  try {
    await prisma.shopOrder.upsert({
      where: { ref: order.ref },
      create: {
        ref: order.ref,
        createdAt: new Date(order.createdAt),
        name: order.name,
        phone: order.phone,
        email: order.email,
        note: order.note,
        linesJson: JSON.stringify(order.lines),
        sampleTotalHkd: order.sampleTotalHkd,
        status: order.status,
      },
      update: {
        name: order.name,
        phone: order.phone,
        email: order.email,
        note: order.note,
        linesJson: JSON.stringify(order.lines),
        sampleTotalHkd: order.sampleTotalHkd,
        status: order.status,
      },
    });
  } catch (error) {
    logDbSyncError('syncShopOrderToDatabase', error);
  }
}

export async function syncCheckInToDatabase(ref: string, checkedInAt: string) {
  if (!databaseEnabled()) return;
  try {
    await prisma.eventRegistration.update({
      where: { ref },
      data: { checkedInAt: new Date(checkedInAt) },
    });
  } catch (error) {
    logDbSyncError('syncCheckInToDatabase', error);
  }
}
