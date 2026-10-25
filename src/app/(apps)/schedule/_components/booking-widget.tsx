"use client";

import { ArrowLeftIcon, GlobeIcon } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createBooking } from "../_actions/booking";
import type { FormState } from "../_lib/schemas";
import { Field, nativeSelectClass } from "./field";
import { useBrowserTimeZone, zoneOptions } from "./use-time-zone";

type Props = { eventTypeId: string; slots: string[] };

function dateKey(iso: string, timeZone: string) {
  // en-CA formats as YYYY-MM-DD, which sorts and groups cleanly.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
}

export function BookingWidget(props: Props) {
  const browserTz = useBrowserTimeZone();
  // Slot times depend on the visitor's zone, which the server doesn't know; render after hydration.
  if (!browserTz) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  return <BookingWidgetInner {...props} initialTimeZone={browserTz} />;
}

function BookingWidgetInner({ eventTypeId, slots, initialTimeZone }: Props & { initialTimeZone: string }) {
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(createBooking, { ok: false });

  const byDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of slots) {
      const key = dateKey(s, timeZone);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [slots, timeZone]);

  const dates = [...byDate.keys()];
  const date = pickedDate && byDate.has(pickedDate) ? pickedDate : dates[0];
  const dayLabel = (key: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }).format(new Date(`${key}T12:00:00Z`));
  const timeLabel = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

  if (slots.length === 0) {
    return <p className="rounded-xl border p-6 text-muted-foreground">No times are available right now.</p>;
  }

  if (slot) {
    return (
      <form action={action} className="grid gap-4 rounded-xl border p-5">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Back" onClick={() => setSlot(null)}>
            <ArrowLeftIcon />
          </Button>
          <p className="font-medium">
            {new Intl.DateTimeFormat("en-US", { timeZone, dateStyle: "full", timeStyle: "short" }).format(new Date(slot))}
          </p>
        </div>
        <input type="hidden" name="eventTypeId" value={eventTypeId} />
        <input type="hidden" name="start" value={slot} />
        <input type="hidden" name="timeZone" value={timeZone} />
        <Field id="name" label="Name" errors={state.fieldErrors?.name}>
          <Input id="name" name="name" required maxLength={100} autoComplete="name" />
        </Field>
        <Field id="email" label="Email" errors={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" required maxLength={200} autoComplete="email" />
        </Field>
        <Field id="notes" label="Anything to share beforehand?" errors={state.fieldErrors?.notes}>
          <Textarea id="notes" name="notes" rows={3} maxLength={1000} />
        </Field>
        {state.message && !state.ok && <p className="text-sm text-destructive">{state.message}</p>}
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-4 rounded-xl border p-5">
      <div className="flex gap-2 overflow-x-auto pb-1" role="listbox" aria-label="Date">
        {dates.map((d) => (
          <button
            key={d}
            type="button"
            role="option"
            aria-selected={d === date}
            onClick={() => setPickedDate(d)}
            className={cn(
              "flex min-w-16 flex-col items-center rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted",
              d === date && "border-primary bg-primary text-primary-foreground hover:bg-primary",
            )}
          >
            <span className="text-xs opacity-80">{dayLabel(d, { weekday: "short" })}</span>
            <span className="font-medium">{dayLabel(d, { month: "short", day: "numeric" })}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(byDate.get(date) ?? []).map((s) => (
          <Button key={s} variant="outline" onClick={() => setSlot(s)}>
            {timeLabel(s)}
          </Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <GlobeIcon className="size-4" />
        <span className="sr-only">Time zone</span>
        <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className={cn(nativeSelectClass, "w-auto")}>
          {zoneOptions(timeZone).map((z) => (
            <option key={z} value={z}>
              {z.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
