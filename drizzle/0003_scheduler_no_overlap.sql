-- Two confirmed bookings for the same host can never overlap, including buffers.
-- btree_gist lets a GiST index combine equality on host_user_id with range overlap.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "scheduler_booking"
  ADD CONSTRAINT "scheduler_booking_no_overlap"
  EXCLUDE USING gist (
    "host_user_id" WITH =,
    tstzrange("starts_at", "blocked_until", '[)') WITH &&
  )
  WHERE ("status" = 'confirmed');
