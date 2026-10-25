"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfile } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { FormField, nativeSelectClass } from "@/components/form-field";
import { useBrowserTimeZone, zoneOptions } from "./use-time-zone";
import { useFormToast } from "./use-form-toast";

type Props = { profile?: { handle: string; displayName: string; timeZone: string } };

export function ProfileForm({ profile }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, { ok: false });
  useFormToast(state);
  // null until hydrated: the zone list differs between Node and browsers, so it's client-only.
  const browserTz = useBrowserTimeZone();
  const timeZone = profile?.timeZone ?? browserTz ?? "UTC";

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Your name" error={state.fieldErrors?.displayName?.[0]}>
        <Input name="displayName" defaultValue={profile?.displayName} required maxLength={60} />
      </FormField>
      <FormField label="Booking link"
        hint="amjadscorner.us/meet/your-handle"
        error={state.fieldErrors?.handle?.[0]}
      >
        <Input name="handle" defaultValue={profile?.handle} required pattern="[a-zA-Z0-9\-]{3,40}" />
      </FormField>
      <FormField label="Time zone" error={state.fieldErrors?.timeZone?.[0]}>
        {browserTz ? (
          <select name="timeZone" defaultValue={timeZone} className={nativeSelectClass}>
            {zoneOptions(timeZone).map((z) => (
              <option key={z} value={z}>
                {z.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        ) : (
          <select disabled className={nativeSelectClass}>
            <option>{profile ? timeZone.replaceAll("_", " ") : "Detecting…"}</option>
          </select>
        )}
      </FormField>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : profile ? "Save profile" : "Create my booking page"}
        </Button>
      </div>
    </form>
  );
}
