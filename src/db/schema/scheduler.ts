import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Times of day are stored as minutes since local midnight (0–1440) in the host's time zone.
// Booking overlap is enforced in Postgres by an exclusion constraint added in a custom
// migration (see drizzle/*_scheduler_no_overlap.sql), not declared here.

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const ownerId = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const schedulerProfile = pgTable("scheduler_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  timeZone: text("time_zone").notNull(),
  ...timestamps,
});

export const schedulerEventType = pgTable(
  "scheduler_event_type",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: ownerId(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    durationMinutes: integer("duration_minutes").notNull(),
    bufferMinutes: integer("buffer_minutes").notNull().default(0),
    minNoticeMinutes: integer("min_notice_minutes").notNull().default(240),
    maxDaysAhead: integer("max_days_ahead").notNull().default(30),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    unique("scheduler_event_type_user_slug").on(t.userId, t.slug),
    check("scheduler_event_type_duration", sql`${t.durationMinutes} between 5 and 480`),
  ],
);

export const schedulerAvailabilityRule = pgTable(
  "scheduler_availability_rule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: ownerId(),
    // ISO weekday: 1 = Monday … 7 = Sunday (matches Temporal's dayOfWeek).
    weekday: smallint("weekday").notNull(),
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
  },
  (t) => [
    index("scheduler_availability_rule_user_idx").on(t.userId),
    check("scheduler_availability_rule_weekday", sql`${t.weekday} between 1 and 7`),
    check(
      "scheduler_availability_rule_range",
      sql`${t.startMinute} >= 0 and ${t.endMinute} <= 1440 and ${t.startMinute} < ${t.endMinute}`,
    ),
  ],
);

// A date with any override rows ignores the weekly rules for that date.
// A row with null start/end marks the whole date unavailable.
export const schedulerDateOverride = pgTable(
  "scheduler_date_override",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: ownerId(),
    date: date("date").notNull(),
    startMinute: integer("start_minute"),
    endMinute: integer("end_minute"),
  },
  (t) => [
    index("scheduler_date_override_user_date_idx").on(t.userId, t.date),
    check(
      "scheduler_date_override_range",
      sql`(${t.startMinute} is null and ${t.endMinute} is null) or (${t.startMinute} >= 0 and ${t.endMinute} <= 1440 and ${t.startMinute} < ${t.endMinute})`,
    ),
  ],
);

export const bookingStatuses = ["confirmed", "cancelled"] as const;

export const schedulerBooking = pgTable(
  "scheduler_booking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventTypeId: uuid("event_type_id")
      .notNull()
      .references(() => schedulerEventType.id, { onDelete: "cascade" }),
    hostUserId: text("host_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    // endsAt + the event type's buffer; the range [startsAt, blockedUntil) is what can't overlap.
    blockedUntil: timestamp("blocked_until", { withTimezone: true }).notNull(),
    inviteeName: text("invitee_name").notNull(),
    inviteeEmail: text("invitee_email").notNull(),
    inviteeTimeZone: text("invitee_time_zone").notNull(),
    notes: text("notes"),
    status: text("status", { enum: bookingStatuses }).notNull().default("confirmed"),
    // SHA-256 of the secret in the invitee's manage link; the secret itself is never stored.
    manageTokenHash: text("manage_token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [
    index("scheduler_booking_host_starts_idx").on(t.hostUserId, t.startsAt),
    check("scheduler_booking_status", sql`${t.status} in ('confirmed', 'cancelled')`),
    check("scheduler_booking_range", sql`${t.startsAt} < ${t.endsAt} and ${t.endsAt} <= ${t.blockedUntil}`),
  ],
);
