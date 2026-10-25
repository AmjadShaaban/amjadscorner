import { z } from "zod";
import { expenseCategories } from "@/db/schema/expenses";
import { parseAmountToCents } from "./money";

export const expenseSchema = z.object({
  merchant: z.string().trim().min(1, "Required").max(80),
  amount: z.string().transform((v, ctx) => {
    const cents = parseAmountToCents(v);
    if (cents === null || cents >= 100_000_000) {
      ctx.addIssue({ code: "custom", message: "Enter an amount like 12.34" });
      return z.NEVER;
    }
    return cents;
  }),
  spentOn: z.iso.date("Pick a date"),
  category: z.enum(expenseCategories, "Pick a category"),
  notes: z
    .string()
    .trim()
    .max(500)
    .transform((v) => v || null),
  scanned: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  removeReceipt: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

/** YYYY-MM */
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
