import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { CheckCircle2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { schedulerBooking, schedulerEventType, schedulerProfile } from "@/db/schema";
import { getSession } from "@/lib/session";
import { CancelBookingButton } from "../../_components/cancel-booking-button";
import { formatRange } from "../../_lib/format";
import { tokenMatches } from "../../_lib/tokens";

// The URL carries the invitee's manage token; don't leak it to other sites via Referer.
export const metadata: Metadata = { title: "Your booking", referrer: "no-referrer", robots: { index: false } };

export default function BookingPage(props: PageProps<"/schedule/bookings/[id]">) {
  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <BookingDetails {...props} />
      </Suspense>
    </main>
  );
}

async function BookingDetails({ params, searchParams }: PageProps<"/schedule/bookings/[id]">) {
  const { id } = await params;
  const { t, new: isNew } = await searchParams;
  const token = typeof t === "string" ? t : undefined;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [row] = await db
    .select({ booking: schedulerBooking, eventType: schedulerEventType, profile: schedulerProfile })
    .from(schedulerBooking)
    .innerJoin(schedulerEventType, eq(schedulerEventType.id, schedulerBooking.eventTypeId))
    .innerJoin(schedulerProfile, eq(schedulerProfile.userId, schedulerBooking.hostUserId))
    .where(eq(schedulerBooking.id, id));
  if (!row) notFound();
  const { booking, eventType, profile } = row;

  const isInvitee = tokenMatches(token, booking.manageTokenHash);
  const session = isInvitee ? null : await getSession();
  const isHost = session?.user.id === booking.hostUserId;
  if (!isInvitee && !isHost) notFound();

  const timeZone = isInvitee ? booking.inviteeTimeZone : profile.timeZone;
  const cancelled = booking.status === "cancelled";
  await connection();
  const upcoming = booking.startsAt > new Date();

  return (
    <Card>
      <CardHeader>
        {isNew && !cancelled && (
          <p className="mb-2 flex items-center gap-2 font-medium text-green-600 dark:text-green-400">
            <CheckCircle2Icon className="size-5" /> You&apos;re booked
          </p>
        )}
        <CardTitle className="flex items-center gap-2">
          {eventType.title} with {isInvitee ? profile.displayName : booking.inviteeName}
          {cancelled && <Badge variant="destructive">Cancelled</Badge>}
        </CardTitle>
        <CardDescription>{formatRange(booking.startsAt, booking.endsAt, timeZone)}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {eventType.location && (
          <p>
            <span className="text-muted-foreground">Where:</span> {eventType.location}
          </p>
        )}
        {booking.notes && (
          <p>
            <span className="text-muted-foreground">Notes:</span> {booking.notes}
          </p>
        )}
        {isNew && !cancelled && (
          <p className="text-muted-foreground">
            A confirmation with a calendar invite is on its way to {booking.inviteeEmail}. Bookmark this page to manage
            your booking.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {!cancelled && upcoming && <CancelBookingButton bookingId={booking.id} token={isInvitee ? token : undefined} />}
          {isInvitee && (
            <Link href={`/meet/${profile.handle}/${eventType.slug}`} className="self-center underline underline-offset-4">
              {cancelled ? "Book another time" : "Book another meeting"}
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
