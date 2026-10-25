"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEventType } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { FormField, nativeSelectClass } from "@/components/form-field";
import { useFormToast } from "./use-form-toast";

const durations = [15, 30, 45, 60, 90, 120];
const notice = [
  { label: "No minimum", value: 0 },
  { label: "1 hour", value: 60 },
  { label: "4 hours", value: 240 },
  { label: "1 day", value: 1440 },
  { label: "2 days", value: 2880 },
];

export function EventTypeForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createEventType, { ok: false });
  useFormToast(state);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);
  const errors = state.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Title" error={errors.title?.[0]}>
        <Input name="title" placeholder="Intro call" required maxLength={80} />
      </FormField>
      <FormField label="URL" hint="Lowercase letters, numbers and dashes" error={errors.slug?.[0]}>
        <Input name="slug" placeholder="intro-call" required />
      </FormField>
      <FormField label="Duration" error={errors.durationMinutes?.[0]}>
        <select name="durationMinutes" defaultValue={30} className={nativeSelectClass}>
          {durations.map((d) => (
            <option key={d} value={d}>
              {d} minutes
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Buffer after" error={errors.bufferMinutes?.[0]}>
        <select name="bufferMinutes" defaultValue={0} className={nativeSelectClass}>
          {[0, 5, 10, 15, 30].map((d) => (
            <option key={d} value={d}>
              {d ? `${d} minutes` : "None"}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Minimum notice" error={errors.minNoticeMinutes?.[0]}>
        <select name="minNoticeMinutes" defaultValue={240} className={nativeSelectClass}>
          {notice.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Bookable up to" error={errors.maxDaysAhead?.[0]}>
        <select name="maxDaysAhead" defaultValue={30} className={nativeSelectClass}>
          {[7, 14, 30, 60].map((d) => (
            <option key={d} value={d}>
              {d} days ahead
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Location" hint="A video link, phone number or address" error={errors.location?.[0]}>
        <Input name="location" placeholder="Google Meet" maxLength={200} />
      </FormField>
      <FormField label="Description" error={errors.description?.[0]}>
        <Textarea name="description" rows={2} maxLength={500} />
      </FormField>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create event type"}
        </Button>
      </div>
    </form>
  );
}
