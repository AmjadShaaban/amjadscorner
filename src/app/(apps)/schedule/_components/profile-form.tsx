"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfile } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { Field, nativeSelectClass } from "./field";
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
      <Field id="displayName" label="Your name" errors={state.fieldErrors?.displayName}>
        <Input id="displayName" name="displayName" defaultValue={profile?.displayName} required maxLength={60} />
      </Field>
      <Field
        id="handle"
        label="Booking link"
        hint="amjadscorner.us/meet/your-handle"
        errors={state.fieldErrors?.handle}
      >
        <Input id="handle" name="handle" defaultValue={profile?.handle} required pattern="[a-zA-Z0-9\-]{3,40}" />
      </Field>
      <Field id="timeZone" label="Time zone" errors={state.fieldErrors?.timeZone}>
        {browserTz ? (
          <select id="timeZone" name="timeZone" defaultValue={timeZone} className={nativeSelectClass}>
            {zoneOptions(timeZone).map((z) => (
              <option key={z} value={z}>
                {z.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        ) : (
          <select id="timeZone" disabled className={nativeSelectClass}>
            <option>{profile ? timeZone.replaceAll("_", " ") : "Detecting…"}</option>
          </select>
        )}
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : profile ? "Save profile" : "Create my booking page"}
        </Button>
      </div>
    </form>
  );
}
