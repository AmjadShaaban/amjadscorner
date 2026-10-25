import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { updateExpense } from "../_actions/expenses";
import { DeleteExpenseButton } from "../_components/expense-buttons";
import { ExpenseForm } from "../_components/expense-form";
import { getExpense } from "../_lib/data";

export const metadata: Metadata = { title: "Edit expense" };

export default function EditExpensePage(props: PageProps<"/expenses/[id]">) {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-4 sm:p-8">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-muted" />}>
        <EditExpense {...props} />
      </Suspense>
    </main>
  );
}

async function EditExpense({ params }: PageProps<"/expenses/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const session = await getSession();
  const row = session ? await getExpense(session.user.id, id) : undefined;
  if (!row) notFound();

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <Link href={`/expenses?month=${row.spentOn.slice(0, 7)}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← Expenses
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Edit expense</h1>
        </div>
        <DeleteExpenseButton id={row.id} />
      </div>
      <ExpenseForm
        // Remount with fresh values after an edit; preserved (hidden) pages keep old state otherwise.
        key={row.updatedAt.toISOString()}
        action={updateExpense.bind(null, row.id)}
        submitLabel="Save changes"
        initial={{
          merchant: row.merchant,
          amountCents: row.amountCents,
          spentOn: row.spentOn,
          category: row.category,
          notes: row.notes ?? "",
          receiptUrl: row.receiptPath ? `/expenses/receipts/${row.id}` : null,
        }}
      />
    </>
  );
}
