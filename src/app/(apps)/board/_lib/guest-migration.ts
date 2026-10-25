import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { board, boardMember } from "@/db/schema";

/**
 * Moves a guest's boards and memberships to the account they just signed in with.
 * Memberships the account already has (or boards it owns) win over the guest's.
 */
export async function moveBoardData(fromUserId: string, toUserId: string) {
  await db.transaction(async (tx) => {
    await tx.update(board).set({ ownerId: toUserId }).where(eq(board.ownerId, fromUserId));

    const memberships = await tx.select().from(boardMember).where(eq(boardMember.userId, fromUserId));
    for (const m of memberships) {
      const [owned] = await tx.select({ id: board.id }).from(board).where(and(eq(board.id, m.boardId), eq(board.ownerId, toUserId)));
      const [existing] = await tx
        .select({ role: boardMember.role })
        .from(boardMember)
        .where(and(eq(boardMember.boardId, m.boardId), eq(boardMember.userId, toUserId)));
      const where = and(eq(boardMember.boardId, m.boardId), eq(boardMember.userId, fromUserId));
      if (owned || existing) await tx.delete(boardMember).where(where);
      else await tx.update(boardMember).set({ userId: toUserId }).where(where);
    }
  });
}
