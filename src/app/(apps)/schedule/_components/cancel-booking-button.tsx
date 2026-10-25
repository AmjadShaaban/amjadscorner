"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelBookingAsInvitee } from "../_actions/booking";
import { cancelBookingAsHost } from "../_actions/host";

/** Two-step cancel: the first click asks for confirmation. */
export function CancelBookingButton(props: { bookingId: string; token?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
        Cancel booking
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            if (props.token) {
              const result = await cancelBookingAsInvitee(props.bookingId, props.token);
              if (!result.ok && result.message) toast.error(result.message);
            } else {
              await cancelBookingAsHost(props.bookingId);
              toast.success("Booking cancelled");
            }
          })
        }
      >
        {pending ? "Cancelling…" : "Yes, cancel"}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirming(false)}>
        Keep
      </Button>
    </div>
  );
}
