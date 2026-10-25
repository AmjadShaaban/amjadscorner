"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "../../_actions/board";

export function JoinButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await acceptInvite(token);
          if (!result.ok) toast.error(result.message);
        })
      }
    >
      {pending ? "Joining…" : "Join board"}
    </Button>
  );
}
