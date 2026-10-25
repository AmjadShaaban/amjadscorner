CREATE TABLE "scheduler_availability_rule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"weekday" smallint NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	CONSTRAINT "scheduler_availability_rule_weekday" CHECK ("scheduler_availability_rule"."weekday" between 1 and 7),
	CONSTRAINT "scheduler_availability_rule_range" CHECK ("scheduler_availability_rule"."start_minute" >= 0 and "scheduler_availability_rule"."end_minute" <= 1440 and "scheduler_availability_rule"."start_minute" < "scheduler_availability_rule"."end_minute")
);
--> statement-breakpoint
CREATE TABLE "scheduler_booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type_id" uuid NOT NULL,
	"host_user_id" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"blocked_until" timestamp with time zone NOT NULL,
	"invitee_name" text NOT NULL,
	"invitee_email" text NOT NULL,
	"invitee_time_zone" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"manage_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	CONSTRAINT "scheduler_booking_status" CHECK ("scheduler_booking"."status" in ('confirmed', 'cancelled')),
	CONSTRAINT "scheduler_booking_range" CHECK ("scheduler_booking"."starts_at" < "scheduler_booking"."ends_at" and "scheduler_booking"."ends_at" <= "scheduler_booking"."blocked_until")
);
--> statement-breakpoint
CREATE TABLE "scheduler_date_override" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"start_minute" integer,
	"end_minute" integer,
	CONSTRAINT "scheduler_date_override_range" CHECK (("scheduler_date_override"."start_minute" is null and "scheduler_date_override"."end_minute" is null) or ("scheduler_date_override"."start_minute" >= 0 and "scheduler_date_override"."end_minute" <= 1440 and "scheduler_date_override"."start_minute" < "scheduler_date_override"."end_minute"))
);
--> statement-breakpoint
CREATE TABLE "scheduler_event_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"duration_minutes" integer NOT NULL,
	"buffer_minutes" integer DEFAULT 0 NOT NULL,
	"min_notice_minutes" integer DEFAULT 240 NOT NULL,
	"max_days_ahead" integer DEFAULT 30 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scheduler_event_type_user_slug" UNIQUE("user_id","slug"),
	CONSTRAINT "scheduler_event_type_duration" CHECK ("scheduler_event_type"."duration_minutes" between 5 and 480)
);
--> statement-breakpoint
CREATE TABLE "scheduler_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"display_name" text NOT NULL,
	"time_zone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scheduler_profile_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
ALTER TABLE "scheduler_availability_rule" ADD CONSTRAINT "scheduler_availability_rule_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler_booking" ADD CONSTRAINT "scheduler_booking_event_type_id_scheduler_event_type_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."scheduler_event_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler_booking" ADD CONSTRAINT "scheduler_booking_host_user_id_user_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler_date_override" ADD CONSTRAINT "scheduler_date_override_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler_event_type" ADD CONSTRAINT "scheduler_event_type_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduler_profile" ADD CONSTRAINT "scheduler_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scheduler_availability_rule_user_idx" ON "scheduler_availability_rule" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scheduler_booking_host_starts_idx" ON "scheduler_booking" USING btree ("host_user_id","starts_at");--> statement-breakpoint
CREATE INDEX "scheduler_date_override_user_date_idx" ON "scheduler_date_override" USING btree ("user_id","date");