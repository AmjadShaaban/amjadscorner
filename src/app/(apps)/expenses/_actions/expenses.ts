"use server";

import { randomUUID } from "node:crypto";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { getOrCreateUser, getSession } from "@/lib/session";
import { deleteFile, saveFile, sniffImage } from "@/lib/storage";
import { countExpenses } from "../_lib/data";
import { sampleExpenses } from "../_lib/sample-data";
import { expenseSchema, type FormState } from "../_lib/schemas";

const MAX_EXPENSES = 500;
const MAX_RECEIPTS = 100;
// The client compresses receipts to WebP well under this; Server Action bodies cap at 1 MB.
const MAX_RECEIPT_BYTES = 900_000;

type ReceiptResult = { key: string } | { error: string } | null;

async function storeReceipt(userId: string, formData: FormData): Promise<ReceiptResult> {
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_RECEIPT_BYTES) return { error: "That image is too large." };

  const [{ receipts }] = await db
    .select({ receipts: count() })
    .from(expense)
    .where(and(eq(expense.userId, userId), isNotNull(expense.receiptPath)));
  if (receipts >= MAX_RECEIPTS) return { error: `You can store up to ${MAX_RECEIPTS} receipts.` };

  const data = Buffer.from(await file.arrayBuffer());
  const type = sniffImage(data);
  if (!type) return { error: "Receipts must be JPEG, PNG or WebP images." };

  const key = `receipts/${userId}/${randomUUID()}.${type.ext}`;
  await saveFile(key, data, type.contentType);
  return { key };
}

function invalid(error: z.ZodError): FormState {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as FormState["fieldErrors"],
  };
}

export async function createExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { amount, merchant, spentOn, category, notes, scanned } = parsed.data;
  const fields = { merchant, spentOn, category, notes, scanned };

  const user = await getOrCreateUser();
  if ((await countExpenses(user.id)) >= MAX_EXPENSES) {
    return { ok: false, message: `You can track up to ${MAX_EXPENSES} expenses in this demo.` };
  }

  const receipt = await storeReceipt(user.id, formData);
  if (receipt && "error" in receipt) return { ok: false, message: receipt.error };

  await db.insert(expense).values({ ...fields, amountCents: amount, userId: user.id, receiptPath: receipt?.key });
  redirect(`/expenses?month=${fields.spentOn.slice(0, 7)}`);
}

export async function updateExpense(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Your session has expired." };
  const existing = await db.query.expense.findFirst({
    where: and(eq(expense.id, id), eq(expense.userId, session.user.id)),
  });
  if (!existing) return { ok: false, message: "Expense not found." };

  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { amount, removeReceipt, scanned, ...fields } = parsed.data;

  const receipt = await storeReceipt(session.user.id, formData);
  if (receipt && "error" in receipt) return { ok: false, message: receipt.error };
  const receiptPath = receipt ? receipt.key : removeReceipt ? null : existing.receiptPath;

  await db
    .update(expense)
    .set({ ...fields, amountCents: amount, receiptPath, scanned: existing.scanned || scanned })
    .where(eq(expense.id, existing.id));
  // Delete the old file only after the row no longer points at it.
  if (existing.receiptPath && existing.receiptPath !== receiptPath) await deleteFile(existing.receiptPath);

  redirect(`/expenses?month=${fields.spentOn.slice(0, 7)}`);
}

export async function deleteExpense(id: string) {
  const session = await getSession();
  if (!session) return;
  const [deleted] = await db
    .delete(expense)
    .where(and(eq(expense.id, id), eq(expense.userId, session.user.id)))
    .returning({ receiptPath: expense.receiptPath, spentOn: expense.spentOn });
  if (!deleted) return;
  if (deleted.receiptPath) await deleteFile(deleted.receiptPath);
  redirect(`/expenses?month=${deleted.spentOn.slice(0, 7)}`);
}

/** Fills an empty account with six months of realistic demo data. */
export async function loadSampleExpenses() {
  const user = await getOrCreateUser();
  if ((await countExpenses(user.id)) > 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const rows = sampleExpenses(today.slice(0, 7), today);
  await db.insert(expense).values(rows.map((r) => ({ ...r, userId: user.id })));
  refresh();
}
