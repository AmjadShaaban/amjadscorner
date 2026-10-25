import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { board, boardMember } from "@/db/schema";
import { getSession } from "@/lib/session";

export type Access = "owner" | "editor" | "viewer";
const rank: Record<Access, number> = { viewer: 1, editor: 2, owner: 3 };

export function canAtLeast(access: Access, min: Access) {
  return rank[access] >= rank[min];
}

export async function getAccess(boardId: string, userId: string): Promise<{ title: string; access: Access } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(boardId)) return null;
  const [row] = await db
    .select({ title: board.title, ownerId: board.ownerId, role: boardMember.role })
    .from(board)
    .leftJoin(boardMember, and(eq(boardMember.boardId, board.id), eq(boardMember.userId, userId)))
    .where(eq(board.id, boardId));
  if (!row) return null;
  if (row.ownerId === userId) return { title: row.title, access: "owner" };
  return row.role ? { title: row.title, access: row.role } : null;
}

export class BoardAccessError extends Error {}

/** For Server Actions: the signed-in user, if they have at least `min` access to the board. */
export async function requireAccess(boardId: string, min: Access) {
  const session = await getSession();
  if (!session) throw new BoardAccessError("Not signed in");
  const found = await getAccess(boardId, session.user.id);
  if (!found || !canAtLeast(found.access, min)) throw new BoardAccessError("You don't have access to do that");
  return { user: session.user, access: found.access };
}
