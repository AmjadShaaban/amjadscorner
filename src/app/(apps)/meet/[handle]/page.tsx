import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import { getProfileByHandle, listEventTypes } from "../../schedule/_lib/data";
import { formatDuration } from "../../schedule/_lib/format";

export async function generateMetadata({ params }: PageProps<"/meet/[handle]">): Promise<Metadata> {
  const profile = await getProfileByHandle((await params).handle);
  return { title: profile ? `Book time with ${profile.displayName}` : "Not found" };
}

export default function HostPage(props: PageProps<"/meet/[handle]">) {
  return (
    <main className="mx-auto w-full max-w-xl p-4 sm:p-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <HostEventTypes {...props} />
      </Suspense>
    </main>
  );
}

async function HostEventTypes({ params }: PageProps<"/meet/[handle]">) {
  const profile = await getProfileByHandle((await params).handle);
  if (!profile) notFound();
  const eventTypes = await listEventTypes(profile.userId, { activeOnly: true });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{profile.displayName}</h1>
        <p className="text-muted-foreground">Pick a meeting type.</p>
      </div>
      {eventTypes.length === 0 ? (
        <p className="text-muted-foreground">Nothing to book yet.</p>
      ) : (
        <ul className="grid gap-3">
          {eventTypes.map((e) => (
            <li key={e.id}>
              <Link
                href={`/meet/${profile.handle}/${e.slug}`}
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ClockIcon className="size-3.5" /> {formatDuration(e.durationMinutes)}
                  </p>
                </div>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
