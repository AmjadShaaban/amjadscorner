import { Temporal } from "temporal-polyfill";

export type Window = { startMinute: number; endMinute: number };
export type WeeklyRule = Window & { weekday: number };
// startMinute/endMinute both null = unavailable all day.
export type DateOverride = { date: string; startMinute: number | null; endMinute: number | null };
export type Busy = { start: Date; end: Date };

export type SlotInput = {
  timeZone: string;
  rules: WeeklyRule[];
  overrides: DateOverride[];
  durationMinutes: number;
  bufferMinutes: number;
  minNoticeMinutes: number;
  maxDaysAhead: number;
  // Existing confirmed bookings as [startsAt, blockedUntil).
  busy: Busy[];
  now: Date;
};

export function isValidTimeZone(timeZone: string): boolean {
  try {
    Temporal.Now.zonedDateTimeISO(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** Windows for one local date: overrides replace the weekly rules when present. */
export function windowsForDate(
  date: Temporal.PlainDate,
  rules: WeeklyRule[],
  overrides: DateOverride[],
): Window[] {
  const iso = date.toString();
  const forDate = overrides.filter((o) => o.date === iso);
  if (forDate.length > 0) {
    return forDate.flatMap((o) =>
      o.startMinute === null || o.endMinute === null ? [] : [{ startMinute: o.startMinute, endMinute: o.endMinute }],
    );
  }
  return rules.filter((r) => r.weekday === date.dayOfWeek);
}

function atMinute(date: Temporal.PlainDate, minute: number, timeZone: string): Temporal.Instant {
  const day = date.add({ days: Math.floor(minute / 1440) });
  const m = minute % 1440;
  return day
    .toZonedDateTime({ timeZone, plainTime: new Temporal.PlainTime(Math.floor(m / 60), m % 60) })
    .toInstant();
}

/**
 * Bookable slot start times as UTC ISO strings, sorted.
 * Slots step by the event duration in the host's wall-clock time, so they stay on
 * the hour across DST changes. A slot is free when [start, end + buffer) doesn't
 * intersect any busy range, the same rule the database exclusion constraint enforces.
 */
export function computeSlots(input: SlotInput): string[] {
  const { timeZone, durationMinutes, bufferMinutes } = input;
  const now = Temporal.Instant.fromEpochMilliseconds(input.now.getTime());
  const earliest = now.add({ minutes: input.minNoticeMinutes });
  const latest = now.add({ hours: input.maxDaysAhead * 24 });
  const busy = input.busy.map((b) => ({ start: b.start.getTime(), end: b.end.getTime() }));

  const firstDate = now.toZonedDateTimeISO(timeZone).toPlainDate();
  const lastDate = latest.toZonedDateTimeISO(timeZone).toPlainDate();

  const found = new Set<number>();
  for (let date = firstDate; Temporal.PlainDate.compare(date, lastDate) <= 0; date = date.add({ days: 1 })) {
    for (const w of windowsForDate(date, input.rules, input.overrides)) {
      const windowEnd = atMinute(date, w.endMinute, timeZone).epochMilliseconds;
      for (let m = w.startMinute; m + durationMinutes <= w.endMinute; m += durationMinutes) {
        const start = atMinute(date, m, timeZone);
        const startMs = start.epochMilliseconds;
        const endMs = start.add({ minutes: durationMinutes }).epochMilliseconds;
        const blockedMs = endMs + bufferMinutes * 60_000;

        if (endMs > windowEnd) continue; // a DST shift can push a wall-clock slot past the window
        if (Temporal.Instant.compare(start, earliest) < 0) continue;
        if (Temporal.Instant.compare(start, latest) > 0) continue;
        if (busy.some((b) => startMs < b.end && b.start < blockedMs)) continue;
        found.add(startMs);
      }
    }
  }

  return [...found].sort((a, b) => a - b).map((ms) => new Date(ms).toISOString());
}

/** "09:30" -> 570. Accepts "24:00" as 1440 for windows that end at midnight. */
export function parseTimeOfDay(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  return Number(match[2]) < 60 && minutes <= 1440 ? minutes : null;
}

/** 570 -> "09:30" */
export function formatTimeOfDay(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
