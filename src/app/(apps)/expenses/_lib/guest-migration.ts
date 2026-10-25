import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { expense } from "@/db/schema";

/** Moves a guest's expenses to the account they just signed in with. */
export async function moveExpenseData(fromUserId: string, toUserId: string) {
  await db.update(expense).set({ userId: toUserId }).where(eq(expense.userId, fromUserId));
}
