import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { BookingWidget } from "../../../schedule/_components/booking-widget";
import { getActiveEventType, getProfileByHandle, getSlots } from "../../../schedule/_lib/data";
import { formatDuration } from "../../../schedule/_lib/format";

type Props = PageProps<"/meet/[handle]/[slug]">;

async function load(params: Props["params"]) {
  const { handle, slug } = await params;
  const profile = await getProfileByHandle(handle);
  const eventType = profile ? await getActiveEventType(profile.userId, slug) : undefined;
  return profile && eventType ? { profile, eventType } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  return { title: found ? `${found.eventType.title} with ${found.profile.displayName}` : "Not found" };
}

export default function BookPage(props: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Booking {...props} />
      </Suspense>
    </main>
  );
}

async function Booking({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  const { profile, eventType } = found;

  await connection();
  const slots = await getSlots(profile, eventType, new Date());

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <Link href={`/meet/${profile.handle}`} className="text-sm text-muted-foreground hover:text-foreground">
          {profile.displayName}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{eventType.title}</h1>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ClockIcon className="size-3.5" /> {formatDuration(eventType.durationMinutes)}
          </span>
          {eventType.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" /> {eventType.location}
            </span>
          )}
        </p>
        {eventType.description && <p className="mt-2 whitespace-pre-line">{eventType.description}</p>}
      </div>
      <BookingWidget eventTypeId={eventType.id} slots={slots} />
    </div>
  );
}
