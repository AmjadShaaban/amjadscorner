import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Temporal } from "temporal-polyfill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { DateOverrideForm, RemoveOverrideButton } from "../_components/date-override-form";
import { WeeklyHoursEditor, type DayHours } from "../_components/weekly-hours-editor";
import { getAvailability, getProfileForUser } from "../_lib/data";
import { formatTimeOfDay } from "../_lib/slots";

export const metadata: Metadata = { title: "Availability" };

export default function AvailabilityPage() {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 p-4 sm:p-8">
      <div>
        <Link href="/schedule" className="text-sm text-muted-foreground hover:text-foreground">
          ← Scheduler
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Availability</h1>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <AvailabilityEditor />
      </Suspense>
    </main>
  );
}

async function AvailabilityEditor() {
  const session = await getSession();
  const profile = session ? await getProfileForUser(session.user.id) : undefined;
  if (!profile) redirect("/schedule");

  await connection();
  const today = Temporal.Now.plainDateISO(profile.timeZone).toString();
  const { rules, overrides } = await getAvailability(profile.userId, today);

  const days: DayHours[] = [];
  for (const r of rules) {
    let day = days.find((d) => d.weekday === r.weekday);
    if (!day) days.push((day = { weekday: r.weekday, windows: [] }));
    day.windows.push({ start: formatTimeOfDay(r.startMinute), end: formatTimeOfDay(r.endMinute) });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Weekly hours</CardTitle>
          <CardDescription>In your time zone, {profile.timeZone.replaceAll("_", " ")}.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklyHoursEditor initial={days} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Date overrides</CardTitle>
          <CardDescription>Block out a day or set different hours for it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {overrides.length > 0 && (
            <ul className="divide-y">
              {overrides.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    <span className="font-medium">
                      {Temporal.PlainDate.from(o.date).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {o.startMinute === null || o.endMinute === null
                        ? "Unavailable"
                        : `${formatTimeOfDay(o.startMinute)}–${formatTimeOfDay(o.endMinute)}`}
                    </span>
                  </span>
                  <RemoveOverrideButton id={o.id} />
                </li>
              ))}
            </ul>
          )}
          <DateOverrideForm minDate={today} />
        </CardContent>
      </Card>
    </>
  );
}
