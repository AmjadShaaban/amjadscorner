"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEventType } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { Field, nativeSelectClass } from "./field";
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
      <Field id="title" label="Title" errors={errors.title}>
        <Input id="title" name="title" placeholder="Intro call" required maxLength={80} />
      </Field>
      <Field id="slug" label="URL" hint="Lowercase letters, numbers and dashes" errors={errors.slug}>
        <Input id="slug" name="slug" placeholder="intro-call" required />
      </Field>
      <Field id="durationMinutes" label="Duration" errors={errors.durationMinutes}>
        <select id="durationMinutes" name="durationMinutes" defaultValue={30} className={nativeSelectClass}>
          {durations.map((d) => (
            <option key={d} value={d}>
              {d} minutes
            </option>
          ))}
        </select>
      </Field>
      <Field id="bufferMinutes" label="Buffer after" errors={errors.bufferMinutes}>
        <select id="bufferMinutes" name="bufferMinutes" defaultValue={0} className={nativeSelectClass}>
          {[0, 5, 10, 15, 30].map((d) => (
            <option key={d} value={d}>
              {d ? `${d} minutes` : "None"}
            </option>
          ))}
        </select>
      </Field>
      <Field id="minNoticeMinutes" label="Minimum notice" errors={errors.minNoticeMinutes}>
        <select id="minNoticeMinutes" name="minNoticeMinutes" defaultValue={240} className={nativeSelectClass}>
          {notice.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="maxDaysAhead" label="Bookable up to" errors={errors.maxDaysAhead}>
        <select id="maxDaysAhead" name="maxDaysAhead" defaultValue={30} className={nativeSelectClass}>
          {[7, 14, 30, 60].map((d) => (
            <option key={d} value={d}>
              {d} days ahead
            </option>
          ))}
        </select>
      </Field>
      <Field id="location" label="Location" hint="A video link, phone number or address" errors={errors.location}>
        <Input id="location" name="location" placeholder="Google Meet" maxLength={200} />
      </Field>
      <Field id="description" label="Description" errors={errors.description}>
        <Textarea id="description" name="description" rows={2} maxLength={500} />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create event type"}
        </Button>
      </div>
    </form>
  );
}
