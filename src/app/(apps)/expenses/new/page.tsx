import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { createExpense } from "../_actions/expenses";
import { ExpenseForm } from "../_components/expense-form";

export const metadata: Metadata = { title: "Add expense" };

export default function NewExpensePage() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-8">
      <div>
        <Link href="/expenses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Expenses
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Add expense</h1>
      </div>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-muted" />}>
        <NewExpenseForm />
      </Suspense>
    </main>
  );
}

async function NewExpenseForm() {
  await connection();
  return (
    <ExpenseForm
      action={createExpense}
      submitLabel="Save expense"
      initial={{
        merchant: "",
        amountCents: null,
        spentOn: new Date().toISOString().slice(0, 10),
        category: "",
        notes: "",
        receiptUrl: null,
      }}
    />
  );
}
