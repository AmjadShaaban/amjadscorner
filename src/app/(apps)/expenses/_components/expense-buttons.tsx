"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteExpense, loadSampleExpenses } from "../_actions/expenses";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button type="button" variant="ghost" onClick={() => setConfirming(true)}>
        Delete
      </Button>
    );
  }
  return (
    <div className="flex gap-1">
      <Button type="button" variant="destructive" disabled={pending} onClick={() => startTransition(() => deleteExpense(id))}>
        {pending ? "Deleting…" : "Yes, delete"}
      </Button>
      <Button type="button" variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </div>
  );
}

export function SampleDataButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="outline" disabled={pending} onClick={() => startTransition(() => loadSampleExpenses())}>
      {pending ? "Loading…" : "Load sample data"}
    </Button>
  );
}
