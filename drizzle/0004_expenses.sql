CREATE TABLE "expense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"merchant" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"spent_on" date NOT NULL,
	"category" text NOT NULL,
	"notes" text,
	"receipt_path" text,
	"scanned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expense_amount" CHECK ("expense"."amount_cents" > 0 and "expense"."amount_cents" < 100000000),
	CONSTRAINT "expense_category" CHECK (category in ('Groceries', 'Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Travel', 'Other'))
);
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_user_spent_on_idx" ON "expense" USING btree ("user_id","spent_on");