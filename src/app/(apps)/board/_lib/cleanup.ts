import "server-only";
import { and, asc, eq, inArray, not, sql } from "drizzle-orm";
import type { db } from "@/db";
import { board, boardMember, user } from "@/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Before guest owners are deleted, hand each of their boards to a real (signed-in)
 * member so shared boards survive. Editors are preferred, then earliest to join.
 * Boards with no real member are left to be deleted with their owner.
 * Returns how many boards changed hands.
 */
export async function handOverGuestBoards(tx: Tx, guestIds: string[]): Promise<number> {
  if (guestIds.length === 0) return 0;
  const owned = await tx.select({ id: board.id }).from(board).where(inArray(board.ownerId, guestIds));
  let handedOver = 0;
  for (const { id } of owned) {
    const [heir] = await tx
      .select({ userId: boardMember.userId })
      .from(boardMember)
      .innerJoin(user, eq(user.id, boardMember.userId))
      .where(
        and(
          eq(boardMember.boardId, id),
          sql`coalesce(${user.isAnonymous}, false) = false`,
          not(inArray(boardMember.userId, guestIds)),
        ),
      )
      .orderBy(asc(boardMember.role), asc(boardMember.createdAt)) // "editor" sorts before "viewer"
      .limit(1);
    if (!heir) continue;
    await tx.update(board).set({ ownerId: heir.userId }).where(eq(board.id, id));
    await tx.delete(boardMember).where(and(eq(boardMember.boardId, id), eq(boardMember.userId, heir.userId)));
    handedOver++;
  }
  return handedOver;
}
