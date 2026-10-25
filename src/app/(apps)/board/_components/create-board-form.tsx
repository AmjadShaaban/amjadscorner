"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBoard } from "../_actions/board";

export function CreateBoardForm() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const title = String(new FormData(form).get("title") ?? "").trim();
        if (!title) return;
        startTransition(async () => {
          const result = await createBoard({ title });
          // On success createBoard redirects; we only get here on failure.
          if (!result.ok) toast.error(result.message);
        });
      }}
    >
      <Input name="title" aria-label="New board name" placeholder="New board name" maxLength={80} required className="max-w-xs" />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create board"}
      </Button>
    </form>
  );
}
