import "server-only";
import { and, asc, eq, gt, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  schedulerAvailabilityRule,
  schedulerBooking,
  schedulerDateOverride,
  schedulerEventType,
  schedulerProfile,
} from "@/db/schema";
import { computeSlots } from "./slots";

export type Profile = typeof schedulerProfile.$inferSelect;
export type EventType = typeof schedulerEventType.$inferSelect;

export async function getProfileForUser(userId: string) {
  return db.query.schedulerProfile.findFirst({ where: eq(schedulerProfile.userId, userId) });
}

export async function getProfileByHandle(handle: string) {
  return db.query.schedulerProfile.findFirst({ where: eq(schedulerProfile.handle, handle.toLowerCase()) });
}

export async function listEventTypes(userId: string, { activeOnly = false } = {}) {
  return db.query.schedulerEventType.findMany({
    where: activeOnly
      ? and(eq(schedulerEventType.userId, userId), eq(schedulerEventType.active, true))
      : eq(schedulerEventType.userId, userId),
    orderBy: asc(schedulerEventType.createdAt),
  });
}

export async function getActiveEventType(userId: string, slug: string) {
  return db.query.schedulerEventType.findFirst({
    where: and(
      eq(schedulerEventType.userId, userId),
      eq(schedulerEventType.slug, slug.toLowerCase()),
      eq(schedulerEventType.active, true),
    ),
  });
}

export async function getAvailability(userId: string, fromDate?: string) {
  const [rules, overrides] = await Promise.all([
    db.query.schedulerAvailabilityRule.findMany({
      where: eq(schedulerAvailabilityRule.userId, userId),
      orderBy: [asc(schedulerAvailabilityRule.weekday), asc(schedulerAvailabilityRule.startMinute)],
    }),
    db.query.schedulerDateOverride.findMany({
      where: fromDate
        ? and(eq(schedulerDateOverride.userId, userId), gte(schedulerDateOverride.date, fromDate))
        : eq(schedulerDateOverride.userId, userId),
      orderBy: [asc(schedulerDateOverride.date), asc(schedulerDateOverride.startMinute)],
    }),
  ]);
  return { rules, overrides };
}

/** Bookable slots for an event type, as UTC ISO strings. */
export async function getSlots(profile: Profile, eventType: EventType, now: Date) {
  const until = new Date(now.getTime() + (eventType.maxDaysAhead + 1) * 86_400_000);
  const [{ rules, overrides }, busy] = await Promise.all([
    getAvailability(profile.userId, now.toISOString().slice(0, 10)),
    db
      .select({ start: schedulerBooking.startsAt, end: schedulerBooking.blockedUntil })
      .from(schedulerBooking)
      .where(
        and(
          eq(schedulerBooking.hostUserId, profile.userId),
          eq(schedulerBooking.status, "confirmed"),
          gt(schedulerBooking.blockedUntil, now),
          lt(schedulerBooking.startsAt, until),
        ),
      ),
  ]);

  return computeSlots({
    timeZone: profile.timeZone,
    rules,
    overrides,
    durationMinutes: eventType.durationMinutes,
    bufferMinutes: eventType.bufferMinutes,
    minNoticeMinutes: eventType.minNoticeMinutes,
    maxDaysAhead: eventType.maxDaysAhead,
    busy,
    now,
  });
}

export async function listUpcomingBookings(hostUserId: string, now: Date) {
  return db
    .select({
      id: schedulerBooking.id,
      startsAt: schedulerBooking.startsAt,
      endsAt: schedulerBooking.endsAt,
      inviteeName: schedulerBooking.inviteeName,
      inviteeEmail: schedulerBooking.inviteeEmail,
      notes: schedulerBooking.notes,
      eventTitle: schedulerEventType.title,
    })
    .from(schedulerBooking)
    .innerJoin(schedulerEventType, eq(schedulerEventType.id, schedulerBooking.eventTypeId))
    .where(
      and(
        eq(schedulerBooking.hostUserId, hostUserId),
        eq(schedulerBooking.status, "confirmed"),
        gt(schedulerBooking.endsAt, now),
      ),
    )
    .orderBy(asc(schedulerBooking.startsAt))
    .limit(50);
}
