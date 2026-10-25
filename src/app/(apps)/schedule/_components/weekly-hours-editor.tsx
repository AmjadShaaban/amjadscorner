"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveWeeklyHours } from "../_actions/host";
import type { FormState } from "../_lib/schemas";
import { useFormToast } from "./use-form-toast";

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export type DayHours = { weekday: number; windows: { start: string; end: string }[] };

export function WeeklyHoursEditor({ initial }: { initial: DayHours[] }) {
  const [days, setDays] = useState<DayHours[]>(() =>
    dayNames.map((_, i) => initial.find((d) => d.weekday === i + 1) ?? { weekday: i + 1, windows: [] }),
  );
  const [state, action, pending] = useActionState<FormState, FormData>(saveWeeklyHours, { ok: false });
  useFormToast(state);

  function update(weekday: number, windows: DayHours["windows"]) {
    setDays((prev) => prev.map((d) => (d.weekday === weekday ? { ...d, windows } : d)));
  }

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="days" value={JSON.stringify(days.filter((d) => d.windows.length))} />
      {days.map((day) => (
        <div key={day.weekday} className="flex flex-col gap-2 border-b pb-3 last:border-0 sm:flex-row sm:items-start">
          <label className="flex w-36 shrink-0 items-center gap-2 pt-1.5 text-sm font-medium">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={day.windows.length > 0}
              onChange={(e) => update(day.weekday, e.target.checked ? [{ start: "09:00", end: "17:00" }] : [])}
            />
            {dayNames[day.weekday - 1]}
          </label>
          <div className="grid flex-1 gap-2">
            {day.windows.length === 0 && <p className="pt-1.5 text-sm text-muted-foreground">Unavailable</p>}
            {day.windows.map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="time"
                  step={900}
                  aria-label={`${dayNames[day.weekday - 1]} start`}
                  value={w.start}
                  onChange={(e) =>
                    update(day.weekday, day.windows.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))
                  }
                  className="w-32"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="time"
                  step={900}
                  aria-label={`${dayNames[day.weekday - 1]} end`}
                  value={w.end}
                  onChange={(e) =>
                    update(day.weekday, day.windows.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))
                  }
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove time range"
                  onClick={() => update(day.weekday, day.windows.filter((_, j) => j !== i))}
                >
                  <XIcon />
                </Button>
                {i === day.windows.length - 1 && day.windows.length < 6 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Add time range"
                    onClick={() => update(day.weekday, [...day.windows, { start: w.end, end: w.end }])}
                  >
                    <PlusIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save weekly hours"}
        </Button>
      </div>
    </form>
  );
}
