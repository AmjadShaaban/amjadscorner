import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { CreateBoardForm } from "./_components/create-board-form";
import { listBoards } from "./_lib/data";

export const metadata: Metadata = { title: "Boards" };

export default function BoardsPage() {
  return (
    <main className="mx-auto grid w-full max-w-4xl gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Boards</h1>
        <p className="text-muted-foreground">Kanban with drag and drop, keyboard support, undo and sharing.</p>
      </div>
      <CreateBoardForm />
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <BoardList />
      </Suspense>
    </main>
  );
}

async function BoardList() {
  const session = await getSession();
  const boards = session ? await listBoards(session.user.id) : [];
  if (boards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No boards yet</CardTitle>
          <CardDescription>Create one above. No sign-up needed: you&apos;ll be a guest until you sign in.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {boards.map((b) => (
        <li key={b.id}>
          <Link href={`/board/${b.id}`} className="block rounded-xl border p-4 transition-colors hover:bg-muted">
            <p className="flex items-center gap-2 font-medium">
              {b.title}
              {!b.isOwner && <Badge variant="secondary">{b.role === "editor" ? "Shared · can edit" : "Shared · view only"}</Badge>}
            </p>
            <p className="text-sm text-muted-foreground">
              Updated{" "}
              {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(b.updatedAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
