import "server-only";
import { and, asc, count, desc, eq, gte, lt, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { addMonths, monthRange } from "./months";

export type Expense = typeof expense.$inferSelect;

export async function countExpenses(userId: string) {
  const [{ total }] = await db.select({ total: count() }).from(expense).where(eq(expense.userId, userId));
  return total;
}

export async function listExpensesForMonth(userId: string, month: string) {
  const { start, end } = monthRange(month);
  return db
    .select()
    .from(expense)
    .where(and(eq(expense.userId, userId), gte(expense.spentOn, start), lt(expense.spentOn, end)))
    .orderBy(desc(expense.spentOn), desc(expense.createdAt));
}

export async function getExpense(userId: string, id: string) {
  return db.query.expense.findFirst({ where: and(eq(expense.id, id), eq(expense.userId, userId)) });
}

/** Totals for `months` months ending with `lastMonth`, zero-filled. */
export async function monthlyTotals(userId: string, lastMonth: string, months = 6) {
  const first = addMonths(lastMonth, -(months - 1));
  const monthExpr = sql<string>`to_char(${expense.spentOn}, 'YYYY-MM')`;
  const rows = await db
    .select({ month: monthExpr, cents: sum(expense.amountCents).mapWith(Number) })
    .from(expense)
    .where(
      and(
        eq(expense.userId, userId),
        gte(expense.spentOn, `${first}-01`),
        lt(expense.spentOn, monthRange(lastMonth).end),
      ),
    )
    .groupBy(monthExpr)
    .orderBy(asc(monthExpr));
  const byMonth = new Map(rows.map((r) => [r.month, r.cents]));
  return Array.from({ length: months }, (_, i) => {
    const month = addMonths(first, i);
    return { month, cents: byMonth.get(month) ?? 0 };
  });
}

export async function categoryTotals(userId: string, month: string) {
  const { start, end } = monthRange(month);
  return db
    .select({ category: expense.category, cents: sum(expense.amountCents).mapWith(Number), count: count() })
    .from(expense)
    .where(and(eq(expense.userId, userId), gte(expense.spentOn, start), lt(expense.spentOn, end)))
    .groupBy(expense.category)
    .orderBy(desc(sum(expense.amountCents)));
}

export async function listAllExpenses(userId: string) {
  return db.select().from(expense).where(eq(expense.userId, userId)).orderBy(desc(expense.spentOn));
}
