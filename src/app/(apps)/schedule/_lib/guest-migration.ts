import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  schedulerAvailabilityRule,
  schedulerBooking,
  schedulerDateOverride,
  schedulerEventType,
  schedulerProfile,
} from "@/db/schema";

/**
 * Moves a guest's scheduler data to the account they just signed in with. If that
 * account already has a scheduler profile, the guest's data is left behind and is
 * deleted along with the guest user.
 */
export async function moveSchedulerData(fromUserId: string, toUserId: string) {
  await db.transaction(async (tx) => {
    const existing = await tx.query.schedulerProfile.findFirst({ where: eq(schedulerProfile.userId, toUserId) });
    if (existing) return;

    await tx.update(schedulerProfile).set({ userId: toUserId }).where(eq(schedulerProfile.userId, fromUserId));
    await tx.update(schedulerEventType).set({ userId: toUserId }).where(eq(schedulerEventType.userId, fromUserId));
    await tx
      .update(schedulerAvailabilityRule)
      .set({ userId: toUserId })
      .where(eq(schedulerAvailabilityRule.userId, fromUserId));
    await tx
      .update(schedulerDateOverride)
      .set({ userId: toUserId })
      .where(eq(schedulerDateOverride.userId, fromUserId));
    await tx
      .update(schedulerBooking)
      .set({ hostUserId: toUserId })
      .where(eq(schedulerBooking.hostUserId, fromUserId));
  });
}
