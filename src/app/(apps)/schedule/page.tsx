import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { CancelBookingButton } from "./_components/cancel-booking-button";
import { CopyLink } from "./_components/copy-link";
import { EventTypeActions } from "./_components/event-type-actions";
import { EventTypeForm } from "./_components/event-type-form";
import { ProfileForm } from "./_components/profile-form";
import { getProfileForUser, listEventTypes, listUpcomingBookings } from "./_lib/data";
import { formatDuration, formatRange } from "./_lib/format";

export const metadata: Metadata = { title: "Scheduler" };

export default function SchedulerPage() {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Scheduler</h1>
        <p className="text-muted-foreground">Share a link, let people pick a time. No double bookings, any time zone.</p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const session = await getSession();
  const profile = session ? await getProfileForUser(session.user.id) : undefined;

  if (!session || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create your booking page</CardTitle>
          <CardDescription>
            {session && !session.user.isAnonymous
              ? "Pick a handle and time zone to get started."
              : "Try it as a guest, no sign-up needed. Sign in later to keep your page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    );
  }

  await connection();
  const [eventTypes, bookings] = await Promise.all([
    listEventTypes(profile.userId),
    listUpcomingBookings(profile.userId, new Date()),
  ]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{profile.displayName}</CardTitle>
          <CardDescription>
            <Link href={`/meet/${profile.handle}`} className="underline underline-offset-4">
              /meet/{profile.handle}
            </Link>{" "}
            · {profile.timeZone.replaceAll("_", " ")}
          </CardDescription>
          <CardAction className="flex gap-2">
            <CopyLink path={`/meet/${profile.handle}`} />
            <Link href="/schedule/availability" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Availability
            </Link>
          </CardAction>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet. Share your link to get some.</p>
          ) : (
            <ul className="divide-y">
              {bookings.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">
                      {b.inviteeName} · {b.eventTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRange(b.startsAt, b.endsAt, profile.timeZone)} · {b.inviteeEmail}
                    </p>
                    {b.notes && <p className="mt-1 text-sm">{b.notes}</p>}
                  </div>
                  <CancelBookingButton bookingId={b.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event types</CardTitle>
          <CardDescription>Each one gets its own booking link.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {eventTypes.length > 0 && (
            <ul className="divide-y">
              {eventTypes.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="flex items-center gap-2 font-medium">
                      {e.title}
                      {!e.active && <Badge variant="secondary">Off</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(e.durationMinutes)} ·{" "}
                      <Link href={`/meet/${profile.handle}/${e.slug}`} className="underline underline-offset-4">
                        /meet/{profile.handle}/{e.slug}
                      </Link>
                    </p>
                  </div>
                  <EventTypeActions id={e.id} active={e.active} />
                </li>
              ))}
            </ul>
          )}
          <EventTypeForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </>
  );
}
