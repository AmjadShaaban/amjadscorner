import "server-only";
import { and, eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { schedulerBooking, schedulerEventType, schedulerProfile, user } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { formatRange } from "./format";
import { buildIcs } from "./ics";

async function loadBooking(bookingId: string) {
  const [row] = await db
    .select({ booking: schedulerBooking, eventType: schedulerEventType, profile: schedulerProfile, host: user })
    .from(schedulerBooking)
    .innerJoin(schedulerEventType, eq(schedulerEventType.id, schedulerBooking.eventTypeId))
    .innerJoin(schedulerProfile, eq(schedulerProfile.userId, schedulerBooking.hostUserId))
    .innerJoin(user, eq(user.id, schedulerBooking.hostUserId))
    .where(eq(schedulerBooking.id, bookingId));
  return row;
}

type Loaded = NonNullable<Awaited<ReturnType<typeof loadBooking>>>;

function ics({ booking, eventType, profile, host }: Loaded, cancelled: boolean) {
  return {
    filename: cancelled ? "cancel.ics" : "invite.ics",
    contentType: `text/calendar; charset=utf-8; method=${cancelled ? "CANCEL" : "REQUEST"}`,
    content: buildIcs({
      uid: `${booking.id}@amjadscorner`,
      start: booking.startsAt,
      end: booking.endsAt,
      title: `${eventType.title} with ${profile.displayName}`,
      description: booking.notes ?? undefined,
      location: eventType.location ?? undefined,
      organizer: { name: profile.displayName, email: host.isAnonymous ? "no-reply@amjadscorner.us" : host.email },
      attendee: { name: booking.inviteeName, email: booking.inviteeEmail },
      sequence: cancelled ? 1 : 0,
      cancelled,
    }),
  };
}

/** Sends confirmation emails after the response is sent, so a slow email API never delays booking. */
export function sendConfirmationEmails(bookingId: string, manageToken: string) {
  after(async () => {
    const row = await loadBooking(bookingId);
    if (!row) return;
    const { booking, eventType, profile, host } = row;
    const manageUrl = `${env.BETTER_AUTH_URL}/schedule/bookings/${booking.id}?t=${manageToken}`;
    const attachment = ics(row, false);

    await sendEmail({
      to: booking.inviteeEmail,
      subject: `Confirmed: ${eventType.title} with ${profile.displayName}`,
      text: [
        `Hi ${booking.inviteeName},`,
        ``,
        `You're booked for ${eventType.title} with ${profile.displayName}.`,
        `When: ${formatRange(booking.startsAt, booking.endsAt, booking.inviteeTimeZone)}`,
        ...(eventType.location ? [`Where: ${eventType.location}`] : []),
        ``,
        `Need to cancel or reschedule? ${manageUrl}`,
      ].join("\n"),
      attachments: [attachment],
    });

    // Guest hosts have placeholder addresses; only email real accounts.
    if (!host.isAnonymous) {
      await sendEmail({
        to: host.email,
        subject: `New booking: ${eventType.title} with ${booking.inviteeName}`,
        text: [
          `${booking.inviteeName} <${booking.inviteeEmail}> booked ${eventType.title}.`,
          `When: ${formatRange(booking.startsAt, booking.endsAt, profile.timeZone)}`,
          ...(booking.notes ? [``, `Notes: ${booking.notes}`] : []),
        ].join("\n"),
        attachments: [attachment],
      });
    }
  });
}

/**
 * Cancels a confirmed booking and notifies the other party. Pass hostUserId to
 * restrict the cancellation to that host's bookings. Returns false if nothing changed.
 */
export async function cancelBookingAndNotify(opts: {
  bookingId: string;
  hostUserId?: string;
  cancelledBy: "host" | "invitee";
}): Promise<boolean> {
  const conditions = [eq(schedulerBooking.id, opts.bookingId), eq(schedulerBooking.status, "confirmed")];
  if (opts.hostUserId) conditions.push(eq(schedulerBooking.hostUserId, opts.hostUserId));

  const updated = await db
    .update(schedulerBooking)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(and(...conditions))
    .returning({ id: schedulerBooking.id });
  if (updated.length === 0) return false;

  after(async () => {
    const row = await loadBooking(opts.bookingId);
    if (!row) return;
    const { booking, eventType, profile, host } = row;
    const attachment = ics(row, true);
    // Each side sees the other person's name.
    await sendEmail({
      to: booking.inviteeEmail,
      subject: `Cancelled: ${eventType.title} with ${profile.displayName}`,
      text: [
        `${eventType.title} with ${profile.displayName} on ${formatRange(booking.startsAt, booking.endsAt, booking.inviteeTimeZone)} was cancelled${opts.cancelledBy === "host" ? " by the host" : ""}.`,
        ``,
        `Book another time: ${env.BETTER_AUTH_URL}/meet/${profile.handle}/${eventType.slug}`,
      ].join("\n"),
      attachments: [attachment],
    });
    if (!host.isAnonymous) {
      await sendEmail({
        to: host.email,
        subject: `Cancelled: ${eventType.title} with ${booking.inviteeName}`,
        text: `${booking.inviteeName} <${booking.inviteeEmail}>: ${formatRange(booking.startsAt, booking.endsAt, profile.timeZone)} was cancelled.`,
        attachments: [attachment],
      });
    }
  });
  return true;
}
