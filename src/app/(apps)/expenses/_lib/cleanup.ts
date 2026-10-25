import "server-only";
import { and, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { expense } from "@/db/schema";

export const RECEIPTS_PREFIX = "receipts/";

/** Storage keys of receipts belonging to these users (collected before their rows are deleted). */
export async function receiptKeysFor(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  const rows = await db
    .select({ key: expense.receiptPath })
    .from(expense)
    .where(and(inArray(expense.userId, userIds), isNotNull(expense.receiptPath)));
  return rows.map((r) => r.key!);
}

/** Which of these storage keys are still referenced by an expense. */
export async function referencedReceiptKeys(keys: string[]): Promise<Set<string>> {
  const referenced = new Set<string>();
  for (let i = 0; i < keys.length; i += 500) {
    const chunk = keys.slice(i, i + 500);
    const rows = await db.select({ key: expense.receiptPath }).from(expense).where(inArray(expense.receiptPath, chunk));
    for (const r of rows) referenced.add(r.key!);
  }
  return referenced;
}
