import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { BoardHeader } from "../_components/board-header";
import { BoardView } from "../_components/board-view";
import { canAtLeast, getAccess } from "../_lib/access";
import { getBoardColumns, getBoardSharing } from "../_lib/data";

export const metadata: Metadata = { title: "Board" };

export default function BoardPage(props: PageProps<"/board/[id]">) {
  return (
    <main className="grid w-full gap-4 p-4 sm:px-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Board {...props} />
      </Suspense>
    </main>
  );
}

async function Board({ params }: PageProps<"/board/[id]">) {
  const { id } = await params;
  const session = await getSession();
  const found = session ? await getAccess(id, session.user.id) : null;
  // Same response for "doesn't exist" and "not yours", so board ids can't be probed.
  if (!found) notFound();

  await connection();
  const [columns, sharing] = await Promise.all([
    getBoardColumns(id),
    found.access === "owner" ? getBoardSharing(id, new Date()) : null,
  ]);

  return (
    <>
      <BoardHeader boardId={id} title={found.title} access={found.access} sharing={sharing} />
      <BoardView boardId={id} columns={columns} canEdit={canAtLeast(found.access, "editor")} />
    </>
  );
}
