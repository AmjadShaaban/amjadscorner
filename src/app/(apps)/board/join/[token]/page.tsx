import type { Metadata } from "next";
import { and, eq, gt, isNull } from "drizzle-orm";
import { connection } from "next/server";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { board, boardInvite } from "@/db/schema";
import { hashToken } from "@/lib/tokens";
import { JoinButton } from "./join-button";

// The URL carries the invite secret; keep it out of Referer headers and search engines.
export const metadata: Metadata = { title: "Join board", referrer: "no-referrer", robots: { index: false } };

export default function JoinPage(props: PageProps<"/board/join/[token]">) {
  return (
    <main className="mx-auto w-full max-w-md p-4 sm:p-8">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <Invite {...props} />
      </Suspense>
    </main>
  );
}

async function Invite({ params }: PageProps<"/board/join/[token]">) {
  const { token } = await params;
  await connection();
  const [invite] = await db
    .select({ title: board.title, role: boardInvite.role })
    .from(boardInvite)
    .innerJoin(board, eq(board.id, boardInvite.boardId))
    .where(and(eq(boardInvite.tokenHash, hashToken(token)), isNull(boardInvite.revokedAt), gt(boardInvite.expiresAt, new Date())));

  if (!invite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invite not valid</CardTitle>
          <CardDescription>This link has expired or was revoked. Ask the board owner for a new one.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Join “{invite.title}”</CardTitle>
        <CardDescription>
          You&apos;ve been invited to {invite.role === "editor" ? "edit" : "view"} this board. No sign-up needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <JoinButton token={token} />
      </CardContent>
    </Card>
  );
}
