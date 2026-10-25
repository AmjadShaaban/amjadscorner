"use client";

import { XIcon } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDateOverride, removeDateOverride } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { Field } from "./field";
import { useFormToast } from "./use-form-toast";

export function DateOverrideForm({ minDate }: { minDate: string }) {
  const [kind, setKind] = useState<"unavailable" | "hours">("unavailable");
  const [state, action, pending] = useActionState<FormState, FormData>(addDateOverride, { ok: false });
  useFormToast(state);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="kind" value={kind} />
      <Field id="override-date" label="Date" errors={state.fieldErrors?.date}>
        <Input id="override-date" type="date" name="date" min={minDate} required className="w-40" />
      </Field>
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
          <Field id="override-start" label="From" errors={state.fieldErrors?.start}>
            <Input id="override-start" type="time" name="start" step={900} defaultValue="09:00" className="w-32" />
          </Field>
          <Field id="override-end" label="To" errors={state.fieldErrors?.end}>
            <Input id="override-end" type="time" name="end" step={900} defaultValue="12:00" className="w-32" />
          </Field>
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
