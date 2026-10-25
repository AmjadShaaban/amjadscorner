"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export function GuestButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signIn.anonymous();
          router.refresh();
        })
      }
      className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-50"
    >
      {pending ? "Starting…" : "Continue as guest"}
    </button>
  );
}
