import { z } from "zod";
import { isValidTimeZone, parseTimeOfDay } from "./slots";

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/, "3–40 characters: lowercase letters, numbers and dashes");

const timeZone = z.string().refine(isValidTimeZone, "Unknown time zone");

const timeOfDay = z
  .string()
  .transform((v, ctx) => {
    const minutes = parseTimeOfDay(v);
    if (minutes === null) {
      ctx.addIssue({ code: "custom", message: "Use HH:MM" });
      return z.NEVER;
    }
    return minutes;
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

export const profileSchema = z.object({
  handle: slug,
  displayName: z.string().trim().min(1, "Required").max(60),
  timeZone,
});

export const eventTypeSchema = z.object({
  title: z.string().trim().min(1, "Required").max(80),
  slug,
  description: optionalText(500),
  location: optionalText(200),
  durationMinutes: z.coerce.number().int().min(5).max(480).multipleOf(5),
  bufferMinutes: z.coerce.number().int().min(0).max(120),
  minNoticeMinutes: z.coerce.number().int().min(0).max(7 * 24 * 60),
  maxDaysAhead: z.coerce.number().int().min(1).max(60),
});

const window = z
  .object({ start: timeOfDay, end: timeOfDay })
  .refine((w) => w.start < w.end, "End must be after start");

function noOverlaps(windows: { start: number; end: number }[]) {
  const sorted = [...windows].sort((a, b) => a.start - b.start);
  return sorted.every((w, i) => i === 0 || sorted[i - 1].end <= w.start);
}

export const weeklyHoursSchema = z
  .array(z.object({ weekday: z.number().int().min(1).max(7), windows: z.array(window).max(6) }))
  .max(7)
  .refine((days) => days.every((d) => noOverlaps(d.windows)), "Time ranges on the same day can't overlap");

export const dateOverrideSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("unavailable"), date: z.iso.date() }),
  z.object({ kind: z.literal("hours"), date: z.iso.date(), start: timeOfDay, end: timeOfDay }).refine(
    (o) => o.start < o.end,
    "End must be after start",
  ),
]);

export const bookingSchema = z.object({
  eventTypeId: z.uuid(),
  start: z.iso.datetime(),
  name: z.string().trim().min(1, "Required").max(100),
  email: z.email("Enter a valid email").max(200),
  timeZone,
  notes: optionalText(1000),
});

export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function invalid(error: z.ZodError, message = "Please fix the highlighted fields."): FormState {
  return { ok: false, message, fieldErrors: z.flattenError(error).fieldErrors as FormState["fieldErrors"] };
}
