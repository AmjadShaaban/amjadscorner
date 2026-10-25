import "server-only";
import { and, eq, gt, inArray, isNotNull, lt, notExists, or, sql } from "drizzle-orm";
import { RECEIPTS_PREFIX, receiptKeysFor, referencedReceiptKeys } from "@/app/(apps)/expenses/_lib/cleanup";
import { handOverGuestBoards } from "@/app/(apps)/board/_lib/cleanup";
import { db } from "@/db";
import { boardInvite, session, user, verification } from "@/db/schema";
import { deleteFile, listFiles } from "@/lib/storage";

const DAY = 86_400_000;
// A guest whose last session expired more than this long ago can never sign back in.
const GUEST_GRACE = DAY;
const INVITE_RETENTION = 30 * DAY;
// Files younger than this may belong to an upload whose row isn't committed yet.
const ORPHAN_MIN_AGE = DAY;

export type CleanupReport = {
  guestsDeleted: number;
  boardsHandedOver: number;
  receiptsDeleted: number;
  orphansDeleted: number;
  sessionsDeleted: number;
  verificationsDeleted: number;
  invitesDeleted: number;
  moreGuestsRemaining: boolean;
};

async function deleteFiles(keys: string[]) {
  let deleted = 0;
  for (const key of keys) {
    try {
      await deleteFile(key);
      deleted++;
    } catch (error) {
      // Left for the orphan sweep on a later run.
      console.error(`[cleanup] could not delete ${key}`, error);
    }
  }
  return deleted;
}

/**
 * Deletes abandoned guest accounts (and, through cascades, their data), then housekeeping.
 * Safe to run repeatedly; processes at most `batchSize` guests per call.
 */
export async function runCleanup({ now = new Date(), batchSize = 200 } = {}): Promise<CleanupReport> {
  const guestCutoff = new Date(now.getTime() - GUEST_GRACE);

  const noLiveSession = notExists(
    db
      .select({ one: sql`1` })
      .from(session)
      .where(and(eq(session.userId, user.id), gt(session.expiresAt, guestCutoff))),
  );
  const stale = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.isAnonymous, true), lt(user.createdAt, guestCutoff), noLiveSession))
    .limit(batchSize + 1);
  const moreGuestsRemaining = stale.length > batchSize;
  const guestIds = stale.slice(0, batchSize).map((r) => r.id);

  // Collect file keys first: once the rows are gone, so is the record of the files.
  const receiptKeys = await receiptKeysFor(guestIds);
  let boardsHandedOver = 0;
  if (guestIds.length) {
    await db.transaction(async (tx) => {
      boardsHandedOver = await handOverGuestBoards(tx, guestIds);
      await tx.delete(user).where(inArray(user.id, guestIds));
    });
  }
  // Delete files only after the rows that point at them are gone.
  const receiptsDeleted = await deleteFiles(receiptKeys);

  const sessionsDeleted = (
    await db.delete(session).where(lt(session.expiresAt, guestCutoff)).returning({ id: session.id })
  ).length;
  const verificationsDeleted = (
    await db.delete(verification).where(lt(verification.expiresAt, now)).returning({ id: verification.id })
  ).length;
  const inviteCutoff = new Date(now.getTime() - INVITE_RETENTION);
  const invitesDeleted = (
    await db
      .delete(boardInvite)
      .where(
        or(
          lt(boardInvite.expiresAt, inviteCutoff),
          and(isNotNull(boardInvite.revokedAt), lt(boardInvite.revokedAt, inviteCutoff)),
        ),
      )
      .returning({ id: boardInvite.id })
  ).length;

  const orphansDeleted = await sweepOrphanedReceipts(now);

  return {
    guestsDeleted: guestIds.length,
    boardsHandedOver,
    receiptsDeleted,
    orphansDeleted,
    sessionsDeleted,
    verificationsDeleted,
    invitesDeleted,
    moreGuestsRemaining,
  };
}

/** Deletes stored receipts that no expense points to (e.g. after a failed delete). */
export async function sweepOrphanedReceipts(now = new Date()): Promise<number> {
  const files = (await listFiles(RECEIPTS_PREFIX)).filter((f) => f.uploadedAt.getTime() < now.getTime() - ORPHAN_MIN_AGE);
  if (files.length === 0) return 0;
  const referenced = await referencedReceiptKeys(files.map((f) => f.key));
  return deleteFiles(files.filter((f) => !referenced.has(f.key)).map((f) => f.key));
}
