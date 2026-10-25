"use client";

import { EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteBoard, leaveBoard, renameBoard, type ActionResult } from "../_actions/board";
import type { Access } from "../_lib/access";
import { ShareDialog, type Sharing } from "./share-dialog";

export function BoardHeader({
  boardId,
  title,
  access,
  sharing,
}: {
  boardId: string;
  title: string;
  access: Access;
  sharing: Sharing | null;
}) {
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const act = (fn: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) toast.error(result.message);
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <Link href="/board" className="text-sm text-muted-foreground hover:text-foreground">
          ← Boards
        </Link>
        {renaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const next = String(new FormData(e.currentTarget).get("title") ?? "").trim();
              setRenaming(false);
              if (next && next !== title) act(() => renameBoard(boardId, { title: next }));
            }}
          >
            <Input
              name="title"
              aria-label="Board name"
              defaultValue={title}
              autoFocus
              maxLength={80}
              className="h-9 max-w-md text-xl font-semibold"
              onBlur={(e) => e.currentTarget.form?.requestSubmit()}
              onKeyDown={(e) => e.key === "Escape" && setRenaming(false)}
            />
          </form>
        ) : (
          <h1 className="flex items-center gap-2 truncate text-2xl font-semibold tracking-tight">
            {title}
            {access !== "owner" && <Badge variant="secondary">{access === "editor" ? "Can edit" : "View only"}</Badge>}
          </h1>
        )}
      </div>
      {sharing && <ShareDialog boardId={boardId} sharing={sharing} />}
      <DropdownMenu onOpenChange={(open) => !open && setConfirmDelete(false)}>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Board options" disabled={pending} />}>
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {access === "owner" ? (
            <>
              <DropdownMenuItem onClick={() => setRenaming(true)}>Rename board</DropdownMenuItem>
              {confirmDelete ? (
                <DropdownMenuItem variant="destructive" onClick={() => act(() => deleteBoard(boardId))}>
                  Yes, delete everything
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem variant="destructive" closeOnClick={false} onClick={() => setConfirmDelete(true)}>
                  Delete board
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <DropdownMenuItem onClick={() => act(() => leaveBoard(boardId))}>Leave board</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
