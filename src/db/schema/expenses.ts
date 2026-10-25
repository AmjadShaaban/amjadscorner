import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const expenseCategories = [
  "Groceries",
  "Dining",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Travel",
  "Other",
] as const;
export type ExpenseCategory = (typeof expenseCategories)[number];

export const expense = pgTable(
  "expense",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    merchant: text("merchant").notNull(),
    // Integer cents avoid floating-point rounding in sums.
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    spentOn: date("spent_on").notNull(),
    category: text("category", { enum: expenseCategories }).notNull(),
    notes: text("notes"),
    // Storage key of the receipt image (Vercel Blob in production, local disk in dev).
    receiptPath: text("receipt_path"),
    // True when fields were pre-filled by in-browser OCR; feeds usage stats.
    scanned: boolean("scanned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("expense_user_spent_on_idx").on(t.userId, t.spentOn),
    check("expense_amount", sql`${t.amountCents} > 0 and ${t.amountCents} < 100000000`),
    check(
      "expense_category",
      sql.raw(`category in (${expenseCategories.map((c) => `'${c}'`).join(", ")})`),
    ),
  ],
);
