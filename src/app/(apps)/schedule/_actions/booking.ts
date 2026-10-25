"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { schedulerBooking, schedulerEventType, schedulerProfile } from "@/db/schema";
import { getSlots } from "../_lib/data";
import { cancelBookingAndNotify, sendConfirmationEmails } from "../_lib/notify";
import { bookingSchema, invalid, type FormState } from "../_lib/schemas";
import { newSecretToken, tokenMatches } from "@/lib/tokens";

// Per host, an email address can hold at most this many upcoming bookings (spam guard).
const MAX_UPCOMING_PER_INVITEE = 3;

function isExclusionViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } };
  return (e.code ?? e.cause?.code) === "23P01";
}

const TAKEN: FormState = { ok: false, message: "Sorry, that time was just booked. Please pick another." };

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const input = parsed.data;

  const [row] = await db
    .select({ eventType: schedulerEventType, profile: schedulerProfile })
    .from(schedulerEventType)
    .innerJoin(schedulerProfile, eq(schedulerProfile.userId, schedulerEventType.userId))
    .where(and(eq(schedulerEventType.id, input.eventTypeId), eq(schedulerEventType.active, true)));
  if (!row) return { ok: false, message: "This event type is no longer available." };
  const { eventType, profile } = row;

  // Never trust the client's slot: it must be one we'd offer right now.
  const now = new Date();
  const start = new Date(input.start);
  const slots = await getSlots(profile, eventType, now);
  if (!slots.includes(start.toISOString())) return TAKEN;

  const email = input.email.toLowerCase();
  const [{ upcoming }] = await db
    .select({ upcoming: count() })
    .from(schedulerBooking)
    .where(
      and(
        eq(schedulerBooking.hostUserId, profile.userId),
        eq(schedulerBooking.inviteeEmail, email),
        eq(schedulerBooking.status, "confirmed"),
        gt(schedulerBooking.startsAt, now),
      ),
    );
  if (upcoming >= MAX_UPCOMING_PER_INVITEE) {
    return { ok: false, message: "You already have several upcoming bookings with this host." };
  }

  const end = new Date(start.getTime() + eventType.durationMinutes * 60_000);
  const { token, hash } = newSecretToken();
  let bookingId: string;
  try {
    // The exclusion constraint is the real guard against double booking: two requests
    // can both pass the slot check above, but only one insert can succeed.
    const [inserted] = await db
      .insert(schedulerBooking)
      .values({
        eventTypeId: eventType.id,
        hostUserId: profile.userId,
        startsAt: start,
        endsAt: end,
        blockedUntil: new Date(end.getTime() + eventType.bufferMinutes * 60_000),
        inviteeName: input.name,
        inviteeEmail: email,
        inviteeTimeZone: input.timeZone,
        notes: input.notes,
        manageTokenHash: hash,
      })
      .returning({ id: schedulerBooking.id });
    bookingId = inserted.id;
  } catch (error) {
    if (isExclusionViolation(error)) return TAKEN;
    throw error;
  }

  sendConfirmationEmails(bookingId, token);
  redirect(`/schedule/bookings/${bookingId}?t=${token}&new=1`);
}

export async function cancelBookingAsInvitee(bookingId: string, token: string): Promise<FormState> {
  const booking = await db.query.schedulerBooking.findFirst({ where: eq(schedulerBooking.id, bookingId) });
  if (!booking || !tokenMatches(token, booking.manageTokenHash)) {
    return { ok: false, message: "This link is invalid." };
  }
  const changed = await cancelBookingAndNotify({ bookingId, cancelledBy: "invitee" });
  if (!changed) return { ok: false, message: "This booking was already cancelled." };
  redirect(`/schedule/bookings/${bookingId}?t=${token}`);
}
