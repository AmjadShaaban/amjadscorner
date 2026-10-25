import "server-only";
import { and, asc, desc, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { board, boardCard, boardColumn, boardInvite, boardMember, user } from "@/db/schema";

/** Byte-order sort for fractional-index keys (see position.ts). */
export const byPosition = (col: typeof boardCard.position | typeof boardColumn.position) => sql`${col} collate "C"`;

export async function listBoards(userId: string) {
  return db
    .selectDistinct({
      id: board.id,
      title: board.title,
      updatedAt: board.updatedAt,
      isOwner: sql<boolean>`${board.ownerId} = ${userId}`,
      role: boardMember.role,
    })
    .from(board)
    .leftJoin(boardMember, and(eq(boardMember.boardId, board.id), eq(boardMember.userId, userId)))
    .where(or(eq(board.ownerId, userId), eq(boardMember.userId, userId)))
    .orderBy(desc(board.updatedAt));
}

export type BoardCardView = { id: string; title: string; description: string | null; version: number };
export type BoardColumnView = { id: string; title: string; cards: BoardCardView[] };

export async function getBoardColumns(boardId: string): Promise<BoardColumnView[]> {
  const [columns, cards] = await Promise.all([
    db
      .select({ id: boardColumn.id, title: boardColumn.title })
      .from(boardColumn)
      .where(eq(boardColumn.boardId, boardId))
      .orderBy(byPosition(boardColumn.position)),
    db
      .select({
        id: boardCard.id,
        columnId: boardCard.columnId,
        title: boardCard.title,
        description: boardCard.description,
        version: boardCard.version,
      })
      .from(boardCard)
      .where(and(eq(boardCard.boardId, boardId), isNull(boardCard.archivedAt)))
      .orderBy(byPosition(boardCard.position)),
  ]);
  return columns.map((c) => ({
    ...c,
    cards: cards
      .filter((card) => card.columnId === c.id)
      .map((card) => ({ id: card.id, title: card.title, description: card.description, version: card.version })),
  }));
}

export async function getBoardSharing(boardId: string, now: Date) {
  const [owner, members, invites] = await Promise.all([
    db
      .select({ name: user.name, email: user.email, isAnonymous: user.isAnonymous })
      .from(board)
      .innerJoin(user, eq(user.id, board.ownerId))
      .where(eq(board.id, boardId)),
    db
      .select({
        userId: boardMember.userId,
        role: boardMember.role,
        name: user.name,
        email: user.email,
        isAnonymous: user.isAnonymous,
      })
      .from(boardMember)
      .innerJoin(user, eq(user.id, boardMember.userId))
      .where(eq(boardMember.boardId, boardId))
      .orderBy(asc(boardMember.createdAt)),
    db
      .select({ id: boardInvite.id, role: boardInvite.role, expiresAt: boardInvite.expiresAt })
      .from(boardInvite)
      .where(and(eq(boardInvite.boardId, boardId), isNull(boardInvite.revokedAt), gt(boardInvite.expiresAt, now)))
      .orderBy(desc(boardInvite.createdAt)),
  ]);
  return { owner: owner[0], members, invites };
}
