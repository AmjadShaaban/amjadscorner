"use server";

import { and, count, desc, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { board, boardCard, boardColumn, boardInvite, boardMember, boardRoles } from "@/db/schema";
import { env } from "@/lib/env";
import { getOrCreateUser } from "@/lib/session";
import { hashToken, newSecretToken } from "@/lib/tokens";
import { BoardAccessError, requireAccess } from "../_lib/access";
import { byPosition } from "../_lib/data";
import { positionBetween, positionsAfter } from "../_lib/position";

const LIMITS = { boards: 20, columns: 20, cards: 500, members: 20, invites: 10 };
const INVITE_DAYS = 7;

export type ActionResult = { ok: true } | { ok: false; message: string };

const id = z.uuid();
const title = (max: number) => z.string().trim().min(1, "Required").max(max);

/** Runs an action body, turning access and validation failures into a result the UI can show. */
async function attempt(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
    return { ok: true };
  } catch (error) {
    if (error instanceof BoardAccessError) return { ok: false, message: error.message };
    if (error instanceof z.ZodError) return { ok: false, message: error.issues[0]?.message ?? "Invalid input" };
    if (error instanceof LimitError) return { ok: false, message: error.message };
    throw error;
  }
}

class LimitError extends Error {}

/** Serializes position changes per board so concurrent moves can't compute the same key. */
async function lockBoard(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], boardId: string) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${boardId}, 0))`);
}

async function touchBoard(boardId: string) {
  await db.update(board).set({ updatedAt: new Date() }).where(eq(board.id, boardId));
}

// ── Boards ──────────────────────────────────────────────────────────────────

export async function createBoard(input: { title: string }): Promise<ActionResult> {
  const parsed = z.object({ title: title(80) }).safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const user = await getOrCreateUser();
  const [{ owned }] = await db.select({ owned: count() }).from(board).where(eq(board.ownerId, user.id));
  if (owned >= LIMITS.boards) return { ok: false, message: `You can own up to ${LIMITS.boards} boards.` };

  const boardId = await db.transaction(async (tx) => {
    const [created] = await tx.insert(board).values({ ownerId: user.id, title: parsed.data.title }).returning({ id: board.id });
    const [todo, doing, done] = positionsAfter(null, 3);
    const columns = await tx
      .insert(boardColumn)
      .values([
        { boardId: created.id, title: "To do", position: todo },
        { boardId: created.id, title: "Doing", position: doing },
        { boardId: created.id, title: "Done", position: done },
      ])
      .returning({ id: boardColumn.id });
    const tips = [
      "Drag cards between columns",
      "Keyboard: focus a card, Space to pick up, arrows to move, Space to drop",
      "Click a card to edit it",
      "Share the board from the top right",
    ];
    await tx.insert(boardCard).values(
      positionsAfter(null, tips.length).map((position, i) => ({
        boardId: created.id,
        columnId: columns[0].id,
        title: tips[i],
        position,
      })),
    );
    return created.id;
  });
  redirect(`/board/${boardId}`);
}

export async function renameBoard(boardId: string, input: { title: string }) {
  return attempt(async () => {
    await requireAccess(boardId, "owner");
    const { title: t } = z.object({ title: title(80) }).parse(input);
    await db.update(board).set({ title: t }).where(eq(board.id, boardId));
    refresh();
  });
}

export async function deleteBoard(boardId: string): Promise<ActionResult> {
  const result = await attempt(async () => {
    await requireAccess(boardId, "owner");
    await db.delete(board).where(eq(board.id, boardId));
  });
  if (result.ok) redirect("/board");
  return result;
}

// ── Columns ─────────────────────────────────────────────────────────────────

export async function addColumn(boardId: string, input: { title: string }) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    const { title: t } = z.object({ title: title(60) }).parse(input);
    await db.transaction(async (tx) => {
      await lockBoard(tx, boardId);
      const [{ total }] = await tx.select({ total: count() }).from(boardColumn).where(eq(boardColumn.boardId, boardId));
      if (total >= LIMITS.columns) throw new LimitError(`A board can have up to ${LIMITS.columns} columns.`);
      const [last] = await tx
        .select({ position: boardColumn.position })
        .from(boardColumn)
        .where(eq(boardColumn.boardId, boardId))
        .orderBy(desc(byPosition(boardColumn.position)))
        .limit(1);
      await tx.insert(boardColumn).values({ boardId, title: t, position: positionBetween(last?.position ?? null, null) });
    });
    await touchBoard(boardId);
    refresh();
  });
}

export async function renameColumn(boardId: string, columnId: string, input: { title: string }) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    const { title: t } = z.object({ title: title(60) }).parse(input);
    await db
      .update(boardColumn)
      .set({ title: t })
      .where(and(eq(boardColumn.id, id.parse(columnId)), eq(boardColumn.boardId, boardId)));
    refresh();
  });
}

/** Moves a column one place left (-1) or right (+1). */
export async function shiftColumn(boardId: string, columnId: string, direction: -1 | 1) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    await db.transaction(async (tx) => {
      await lockBoard(tx, boardId);
      const columns = await tx
        .select({ id: boardColumn.id, position: boardColumn.position })
        .from(boardColumn)
        .where(eq(boardColumn.boardId, boardId))
        .orderBy(byPosition(boardColumn.position));
      const i = columns.findIndex((c) => c.id === columnId);
      const target = i + direction;
      if (i === -1 || target < 0 || target >= columns.length) return;
      const others = columns.filter((c) => c.id !== columnId);
      const before = others[target - 1]?.position ?? null;
      const after = others[target]?.position ?? null;
      await tx.update(boardColumn).set({ position: positionBetween(before, after) }).where(eq(boardColumn.id, columnId));
    });
    refresh();
  });
}

export async function deleteColumn(boardId: string, columnId: string) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    await db.delete(boardColumn).where(and(eq(boardColumn.id, id.parse(columnId)), eq(boardColumn.boardId, boardId)));
    await touchBoard(boardId);
    refresh();
  });
}

// ── Cards ───────────────────────────────────────────────────────────────────

export async function addCard(boardId: string, columnId: string, input: { title: string }) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    const { title: t } = z.object({ title: title(200) }).parse(input);
    await db.transaction(async (tx) => {
      await lockBoard(tx, boardId);
      const [column] = await tx
        .select({ id: boardColumn.id })
        .from(boardColumn)
        .where(and(eq(boardColumn.id, id.parse(columnId)), eq(boardColumn.boardId, boardId)));
      if (!column) throw new BoardAccessError("That column no longer exists");
      const [{ total }] = await tx.select({ total: count() }).from(boardCard).where(eq(boardCard.boardId, boardId));
      if (total >= LIMITS.cards) throw new LimitError(`A board can have up to ${LIMITS.cards} cards.`);
      const [last] = await tx
        .select({ position: boardCard.position })
        .from(boardCard)
        .where(eq(boardCard.columnId, column.id))
        .orderBy(desc(byPosition(boardCard.position)))
        .limit(1);
      await tx.insert(boardCard).values({
        boardId,
        columnId: column.id,
        title: t,
        position: positionBetween(last?.position ?? null, null),
      });
    });
    await touchBoard(boardId);
    refresh();
  });
}

/**
 * Moves a card into `toColumnId`, right after `afterCardId` (or first if null), as the
 * client saw it. The key is computed from the card's real neighbours in the database,
 * so a stale client view still yields a valid, unique position.
 */
export async function moveCard(boardId: string, cardId: string, toColumnId: string, afterCardId: string | null) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    await db.transaction(async (tx) => {
      await lockBoard(tx, boardId);
      const [card] = await tx
        .select({ id: boardCard.id })
        .from(boardCard)
        .where(and(eq(boardCard.id, id.parse(cardId)), eq(boardCard.boardId, boardId), isNull(boardCard.archivedAt)));
      const [column] = await tx
        .select({ id: boardColumn.id })
        .from(boardColumn)
        .where(and(eq(boardColumn.id, id.parse(toColumnId)), eq(boardColumn.boardId, boardId)));
      if (!card || !column) throw new BoardAccessError("That card or column no longer exists");

      const inColumn = and(eq(boardCard.columnId, column.id), ne(boardCard.id, card.id), isNull(boardCard.archivedAt));
      const [anchor] = afterCardId
        ? await tx
            .select({ position: boardCard.position })
            .from(boardCard)
            .where(and(inColumn, eq(boardCard.id, id.parse(afterCardId))))
        : [];

      let lo: string | null;
      let hi: string | null;
      if (anchor) {
        lo = anchor.position;
        const [next] = await tx
          .select({ position: boardCard.position })
          .from(boardCard)
          .where(and(inColumn, gt(byPosition(boardCard.position), lo)))
          .orderBy(byPosition(boardCard.position))
          .limit(1);
        hi = next?.position ?? null;
      } else if (afterCardId) {
        // The anchor moved or was archived meanwhile: append instead of guessing.
        const [last] = await tx
          .select({ position: boardCard.position })
          .from(boardCard)
          .where(inColumn)
          .orderBy(desc(byPosition(boardCard.position)))
          .limit(1);
        [lo, hi] = [last?.position ?? null, null];
      } else {
        const [first] = await tx
          .select({ position: boardCard.position })
          .from(boardCard)
          .where(inColumn)
          .orderBy(byPosition(boardCard.position))
          .limit(1);
        [lo, hi] = [null, first?.position ?? null];
      }

      await tx
        .update(boardCard)
        .set({ columnId: column.id, position: positionBetween(lo, hi) })
        .where(eq(boardCard.id, card.id));
    });
    await touchBoard(boardId);
    refresh();
  });
}

export type UpdateCardResult =
  | ActionResult
  | { ok: false; conflict: { title: string; description: string | null; version: number }; message: string };

/** Optimistic concurrency: the edit applies only if nobody changed the card since `version`. */
export async function updateCard(
  boardId: string,
  cardId: string,
  input: { title: string; description: string; version: number },
): Promise<UpdateCardResult> {
  try {
    await requireAccess(boardId, "editor");
  } catch (error) {
    if (error instanceof BoardAccessError) return { ok: false, message: error.message };
    throw error;
  }
  const parsed = z
    .object({
      title: title(200),
      description: z.string().trim().max(2000).transform((v) => v || null),
      version: z.number().int().positive(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const where = and(eq(boardCard.id, id.parse(cardId)), eq(boardCard.boardId, boardId), isNull(boardCard.archivedAt));
  const updated = await db
    .update(boardCard)
    .set({
      title: parsed.data.title,
      description: parsed.data.description,
      version: sql`${boardCard.version} + 1`,
    })
    .where(and(where, eq(boardCard.version, parsed.data.version)))
    .returning({ id: boardCard.id });

  if (updated.length === 0) {
    const [current] = await db
      .select({ title: boardCard.title, description: boardCard.description, version: boardCard.version })
      .from(boardCard)
      .where(where);
    if (!current) return { ok: false, message: "This card was deleted." };
    return { ok: false, conflict: current, message: "Someone else changed this card. Review their version and save again." };
  }
  await touchBoard(boardId);
  refresh();
  return { ok: true };
}

export async function archiveCard(boardId: string, cardId: string) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    await db
      .update(boardCard)
      .set({ archivedAt: new Date() })
      .where(and(eq(boardCard.id, id.parse(cardId)), eq(boardCard.boardId, boardId)));
    await touchBoard(boardId);
    refresh();
  });
}

export async function restoreCard(boardId: string, cardId: string) {
  return attempt(async () => {
    await requireAccess(boardId, "editor");
    // Its column may have been deleted meanwhile; then the card is gone with it (cascade).
    await db
      .update(boardCard)
      .set({ archivedAt: null })
      .where(and(eq(boardCard.id, id.parse(cardId)), eq(boardCard.boardId, boardId)));
    refresh();
  });
}

// ── Sharing ─────────────────────────────────────────────────────────────────

/** Creates an invite link. The secret is returned once and only its hash is stored. */
export async function createInvite(
  boardId: string,
  input: { role: string },
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    await requireAccess(boardId, "owner");
  } catch (error) {
    if (error instanceof BoardAccessError) return { ok: false, message: error.message };
    throw error;
  }
  const role = z.enum(boardRoles).parse(input.role);
  const now = new Date();
  const [{ active }] = await db
    .select({ active: count() })
    .from(boardInvite)
    .where(and(eq(boardInvite.boardId, boardId), isNull(boardInvite.revokedAt), gt(boardInvite.expiresAt, now)));
  if (active >= LIMITS.invites) return { ok: false, message: "Too many active invite links. Revoke one first." };

  const { token, hash } = newSecretToken();
  await db.insert(boardInvite).values({
    boardId,
    role,
    tokenHash: hash,
    expiresAt: new Date(now.getTime() + INVITE_DAYS * 86_400_000),
  });
  refresh();
  return { ok: true, url: `${env.BETTER_AUTH_URL}/board/join/${token}` };
}

export async function revokeInvite(boardId: string, inviteId: string) {
  return attempt(async () => {
    await requireAccess(boardId, "owner");
    await db
      .update(boardInvite)
      .set({ revokedAt: new Date() })
      .where(and(eq(boardInvite.id, id.parse(inviteId)), eq(boardInvite.boardId, boardId)));
    refresh();
  });
}

export async function setMemberRole(boardId: string, userId: string, role: string) {
  return attempt(async () => {
    await requireAccess(boardId, "owner");
    await db
      .update(boardMember)
      .set({ role: z.enum(boardRoles).parse(role) })
      .where(and(eq(boardMember.boardId, boardId), eq(boardMember.userId, userId)));
    refresh();
  });
}

export async function removeMember(boardId: string, userId: string) {
  return attempt(async () => {
    await requireAccess(boardId, "owner");
    await db.delete(boardMember).where(and(eq(boardMember.boardId, boardId), eq(boardMember.userId, userId)));
    refresh();
  });
}

export async function leaveBoard(boardId: string): Promise<ActionResult> {
  const result = await attempt(async () => {
    const { user, access } = await requireAccess(boardId, "viewer");
    if (access === "owner") throw new BoardAccessError("Owners can't leave their own board; delete it instead.");
    await db.delete(boardMember).where(and(eq(boardMember.boardId, boardId), eq(boardMember.userId, user.id)));
  });
  if (result.ok) redirect("/board");
  return result;
}

/** Joins a board through an invite link, signing the visitor in as a guest if needed. */
export async function acceptInvite(token: string): Promise<ActionResult> {
  const now = new Date();
  const [invite] = await db
    .select({ boardId: boardInvite.boardId, role: boardInvite.role, ownerId: board.ownerId })
    .from(boardInvite)
    .innerJoin(board, eq(board.id, boardInvite.boardId))
    .where(and(eq(boardInvite.tokenHash, hashToken(token)), isNull(boardInvite.revokedAt), gt(boardInvite.expiresAt, now)));
  if (!invite) return { ok: false, message: "This invite link is invalid or has expired." };

  const user = await getOrCreateUser();
  if (invite.ownerId !== user.id) {
    const [{ members }] = await db.select({ members: count() }).from(boardMember).where(eq(boardMember.boardId, invite.boardId));
    const [existing] = await db
      .select({ role: boardMember.role })
      .from(boardMember)
      .where(and(eq(boardMember.boardId, invite.boardId), eq(boardMember.userId, user.id)));
    if (!existing && members >= LIMITS.members) return { ok: false, message: "This board is full." };
    // Never downgrade someone who already has editor access via another link.
    if (!existing || (existing.role === "viewer" && invite.role === "editor")) {
      await db
        .insert(boardMember)
        .values({ boardId: invite.boardId, userId: user.id, role: invite.role })
        .onConflictDoUpdate({ target: [boardMember.boardId, boardMember.userId], set: { role: invite.role } });
    }
  }
  redirect(`/board/${invite.boardId}`);
}
