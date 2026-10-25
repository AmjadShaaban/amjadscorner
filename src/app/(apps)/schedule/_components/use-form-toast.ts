"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { FormState } from "../_lib/schemas";

/** Shows a toast whenever an action returns a new message. */
export function useFormToast(state: FormState) {
  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
}
