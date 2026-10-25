"use client";

import { CheckIcon, CopyIcon, UsersIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { nativeSelectClass } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createInvite, removeMember, revokeInvite, setMemberRole, type ActionResult } from "../_actions/board";

type Person = { name: string; email: string; isAnonymous: boolean | null };
export type Sharing = {
  owner: Person;
  members: (Person & { userId: string; role: "editor" | "viewer" })[];
  invites: { id: string; role: "editor" | "viewer"; expiresAt: Date }[];
};

const who = (p: Person) => (p.isAnonymous ? `${p.name} (guest)` : p.name);

export function ShareDialog({ boardId, sharing }: { boardId: string; sharing: Sharing }) {
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const act = (fn: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) toast.error(result.message);
    });

  return (
    <Dialog onOpenChange={(open) => !open && setLink(null)}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UsersIcon /> Share
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription>
            Anyone with a link can join, no sign-up needed. Changes by others appear when you come back to the tab.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <select
            aria-label="Role for new link"
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className={cn(nativeSelectClass, "w-32")}
          >
            <option value="editor">Can edit</option>
            <option value="viewer">Can view</option>
          </select>
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await createInvite(boardId, { role });
                if (result.ok) {
                  setLink(result.url);
                  setCopied(false);
                } else toast.error(result.message);
              })
            }
          >
            Create invite link
          </Button>
        </div>
        {link && (
          <div className="grid gap-1.5">
            <div className="flex gap-2">
              <Input readOnly value={link} aria-label="Invite link" onFocus={(e) => e.currentTarget.select()} />
              <Button
                variant="outline"
                aria-label="Copy invite link"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Copy it now: for security it won&apos;t be shown again. Expires in 7 days.</p>
          </div>
        )}

        {sharing.invites.length > 0 && (
          <div className="grid gap-1">
            <h3 className="text-sm font-medium">Active links</h3>
            <ul className="divide-y text-sm">
              {sharing.invites.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-1.5">
                  <span>
                    {i.role === "editor" ? "Can edit" : "Can view"}
                    <span className="text-muted-foreground">
                      {" "}
                      · expires{" "}
                      {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(i.expiresAt))}
                    </span>
                  </span>
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => act(() => revokeInvite(boardId, i.id))}>
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />
        <div className="grid gap-1">
          <h3 className="text-sm font-medium">People</h3>
          <ul className="divide-y text-sm">
            <li className="flex items-center justify-between py-1.5">
              <span>{who(sharing.owner)}</span>
              <span className="text-muted-foreground">Owner</span>
            </li>
            {sharing.members.map((m) => (
              <li key={m.userId} className="flex items-center justify-between gap-2 py-1.5">
                <span className="truncate">{who(m)}</span>
                <div className="flex items-center gap-1">
                  <select
                    aria-label={`Role for ${m.name}`}
                    value={m.role}
                    disabled={pending}
                    onChange={(e) => act(() => setMemberRole(boardId, m.userId, e.target.value))}
                    className={cn(nativeSelectClass, "w-28")}
                  >
                    <option value="editor">Can edit</option>
                    <option value="viewer">Can view</option>
                  </select>
                  <Button variant="ghost" size="sm" disabled={pending} onClick={() => act(() => removeMember(boardId, m.userId))}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
