"use client";

import { XIcon } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDateOverride, removeDateOverride } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { FormField } from "@/components/form-field";
import { useFormToast } from "./use-form-toast";

export function DateOverrideForm({ minDate }: { minDate: string }) {
  const [kind, setKind] = useState<"unavailable" | "hours">("unavailable");
  const [state, action, pending] = useActionState<FormState, FormData>(addDateOverride, { ok: false });
  useFormToast(state);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="kind" value={kind} />
      <FormField label="Date" error={state.fieldErrors?.date?.[0]}>
        <Input type="date" name="date" min={minDate} required className="w-40" />
      </FormField>
      <div className="flex gap-1 rounded-lg border p-0.5" role="radiogroup" aria-label="Override type">
        {(["unavailable", "hours"] as const).map((k) => (
          <Button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            size="sm"
            variant={kind === k ? "secondary" : "ghost"}
            onClick={() => setKind(k)}
          >
            {k === "unavailable" ? "Unavailable" : "Custom hours"}
          </Button>
        ))}
      </div>
      {kind === "hours" && (
        <>
          <FormField label="From" error={state.fieldErrors?.start?.[0]}>
            <Input type="time" name="start" step={900} defaultValue="09:00" className="w-32" />
          </FormField>
          <FormField label="To" error={state.fieldErrors?.end?.[0]}>
            <Input type="time" name="end" step={900} defaultValue="12:00" className="w-32" />
          </FormField>
        </>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add override"}
      </Button>
    </form>
  );
}

export function RemoveOverrideButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Remove override"
      disabled={pending}
      onClick={() => startTransition(() => removeDateOverride(id))}
    >
      <XIcon />
    </Button>
  );
}
