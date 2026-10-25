"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteEventType, setEventTypeActive } from "../_actions/host";

export function EventTypeActions({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => startTransition(() => setEventTypeActive(id, !active))}
      >
        {active ? "Turn off" : "Turn on"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteEventType(id);
            if (!result.ok && result.message) toast.error(result.message);
          })
        }
      >
        Delete
      </Button>
    </div>
  );
}
