"use server";

import { and, count, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import {
  schedulerAvailabilityRule,
  schedulerBooking,
  schedulerDateOverride,
  schedulerEventType,
  schedulerProfile,
} from "@/db/schema";
import { getOrCreateUser, getSession } from "@/lib/session";
import {
  dateOverrideSchema,
  eventTypeSchema,
  invalid,
  profileSchema,
  weeklyHoursSchema,
  type FormState,
} from "../_lib/schemas";
import { cancelBookingAndNotify } from "../_lib/notify";

const MAX_EVENT_TYPES = 10;
const MAX_OVERRIDES = 100;

const DEFAULT_HOURS = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 540, endMinute: 1020 }));

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return (e.code ?? e.cause?.code) === "23505";
}

async function requireHost() {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  return session.user;
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const user = await getOrCreateUser();
  try {
    const created = await db
      .insert(schedulerProfile)
      .values({ userId: user.id, ...parsed.data })
      .onConflictDoUpdate({ target: schedulerProfile.userId, set: parsed.data })
      .returning({ createdAt: schedulerProfile.createdAt, updatedAt: schedulerProfile.updatedAt });

    // First-time setup: start with Mon–Fri 9–5 so the booking page works immediately.
    const isNew = created[0].createdAt.getTime() === created[0].updatedAt.getTime();
    const [{ rules }] = await db
      .select({ rules: count() })
      .from(schedulerAvailabilityRule)
      .where(eq(schedulerAvailabilityRule.userId, user.id));
    if (isNew && rules === 0) {
      await db.insert(schedulerAvailabilityRule).values(DEFAULT_HOURS.map((r) => ({ ...r, userId: user.id })));
    }
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { handle: ["That handle is taken"] } };
    throw error;
  }

  refresh();
  return { ok: true, message: "Profile saved" };
}

export async function createEventType(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireHost();
  const parsed = eventTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const [{ total }] = await db
    .select({ total: count() })
    .from(schedulerEventType)
    .where(eq(schedulerEventType.userId, user.id));
  if (total >= MAX_EVENT_TYPES) return { ok: false, message: `You can have up to ${MAX_EVENT_TYPES} event types.` };

  try {
    await db.insert(schedulerEventType).values({ userId: user.id, ...parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { slug: ["You already use this URL"] } };
    throw error;
  }

  refresh();
  return { ok: true, message: "Event type created" };
}

export async function setEventTypeActive(id: string, active: boolean) {
  const user = await requireHost();
  await db
    .update(schedulerEventType)
    .set({ active })
    .where(and(eq(schedulerEventType.id, id), eq(schedulerEventType.userId, user.id)));
  refresh();
}

export async function deleteEventType(id: string): Promise<FormState> {
  const user = await requireHost();
  const [{ upcoming }] = await db
    .select({ upcoming: count() })
    .from(schedulerBooking)
    .where(
      and(
        eq(schedulerBooking.eventTypeId, id),
        eq(schedulerBooking.hostUserId, user.id),
        eq(schedulerBooking.status, "confirmed"),
      ),
    );
  if (upcoming > 0) {
    return { ok: false, message: "This event type has bookings. Cancel them or turn it off instead." };
  }

  await db
    .delete(schedulerEventType)
    .where(and(eq(schedulerEventType.id, id), eq(schedulerEventType.userId, user.id)));
  refresh();
  return { ok: true, message: "Event type deleted" };
}

export async function saveWeeklyHours(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireHost();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("days") ?? "[]"));
  } catch {
    return { ok: false, message: "Invalid data" };
  }
  const parsed = weeklyHoursSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid hours" };

  const rows = parsed.data.flatMap((d) =>
    d.windows.map((w) => ({ userId: user.id, weekday: d.weekday, startMinute: w.start, endMinute: w.end })),
  );
  await db.transaction(async (tx) => {
    await tx.delete(schedulerAvailabilityRule).where(eq(schedulerAvailabilityRule.userId, user.id));
    if (rows.length) await tx.insert(schedulerAvailabilityRule).values(rows);
  });

  refresh();
  return { ok: true, message: "Weekly hours saved" };
}

export async function addDateOverride(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireHost();
  const parsed = dateOverrideSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);

  const [{ total }] = await db
    .select({ total: count() })
    .from(schedulerDateOverride)
    .where(eq(schedulerDateOverride.userId, user.id));
  if (total >= MAX_OVERRIDES) return { ok: false, message: "Too many date overrides; remove some first." };

  const o = parsed.data;
  const result = await db.transaction(async (tx): Promise<FormState | null> => {
    const sameDay = await tx.query.schedulerDateOverride.findMany({
      where: and(eq(schedulerDateOverride.userId, user.id), eq(schedulerDateOverride.date, o.date)),
    });

    // "Unavailable" replaces any hours set for that date; adding hours clears "unavailable".
    if (o.kind === "unavailable") {
      for (const r of sameDay) await tx.delete(schedulerDateOverride).where(eq(schedulerDateOverride.id, r.id));
      await tx.insert(schedulerDateOverride).values({ userId: user.id, date: o.date });
      return null;
    }

    const overlaps = sameDay.some(
      (r) => r.startMinute !== null && r.endMinute !== null && r.startMinute < o.end && o.start < r.endMinute,
    );
    if (overlaps) return { ok: false, message: "Those hours overlap hours already set for that date." };

    for (const r of sameDay.filter((r) => r.startMinute === null)) {
      await tx.delete(schedulerDateOverride).where(eq(schedulerDateOverride.id, r.id));
    }
    await tx
      .insert(schedulerDateOverride)
      .values({ userId: user.id, date: o.date, startMinute: o.start, endMinute: o.end });
    return null;
  });
  if (result) return result;

  refresh();
  return { ok: true, message: "Date override saved" };
}

export async function removeDateOverride(id: string) {
  const user = await requireHost();
  await db
    .delete(schedulerDateOverride)
    .where(and(eq(schedulerDateOverride.id, id), eq(schedulerDateOverride.userId, user.id)));
  refresh();
}

export async function cancelBookingAsHost(id: string) {
  const user = await requireHost();
  await cancelBookingAndNotify({ bookingId: id, hostUserId: user.id, cancelledBy: "host" });
  refresh();
}
