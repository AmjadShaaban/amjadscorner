import { randomUUID } from "node:crypto";
import { utimes } from "node:fs/promises";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { board, boardColumn, boardMember, expense, schedulerProfile, session, user } from "@/db/schema";
import { runCleanup } from "./cleanup";
import { listFiles, saveFile } from "./storage";

// Runs against the real local database and storage (Docker Postgres, .data/uploads).
const DAY = 86_400_000;
const now = new Date();
const ago = (days: number) => new Date(now.getTime() - days * DAY);
const run = randomUUID().slice(0, 8);
const id = (name: string) => `test-${run}-${name}`;
const userIds: string[] = [];

async function makeUser(name: string, opts: { anonymous: boolean; createdAt: Date; sessionExpires?: Date }) {
  const userId = id(name);
  userIds.push(userId);
  await db.insert(user).values({
    id: userId,
    name,
    email: `${userId}@test.invalid`,
    isAnonymous: opts.anonymous,
    createdAt: opts.createdAt,
    updatedAt: opts.createdAt,
  });
  if (opts.sessionExpires) {
    await db.insert(session).values({ id: randomUUID(), token: randomUUID(), userId, expiresAt: opts.sessionExpires });
  }
  return userId;
}

async function makeBoard(ownerId: string, title: string) {
  const [b] = await db.insert(board).values({ ownerId, title }).returning({ id: board.id });
  await db.insert(boardColumn).values({ boardId: b.id, title: "To do", position: "i" });
  return b.id;
}

afterAll(async () => {
  await db.delete(user).where(inArray(user.id, userIds));
});

describe("runCleanup", () => {
  it("deletes abandoned guests and their files, keeps everyone else, and rescues shared boards", async () => {
    const abandoned = await makeUser("abandoned", { anonymous: true, createdAt: ago(10), sessionExpires: ago(3) });
    const active = await makeUser("active", { anonymous: true, createdAt: ago(10), sessionExpires: ago(-5) });
    const brandNew = await makeUser("new", { anonymous: true, createdAt: now });
    const real = await makeUser("real", { anonymous: false, createdAt: ago(30) });
    const otherGuest = await makeUser("other-guest", { anonymous: true, createdAt: ago(10), sessionExpires: ago(-5) });

    // The abandoned guest's data.
    const receiptKey = `receipts/${abandoned}/${randomUUID()}.webp`;
    await saveFile(receiptKey, Buffer.from("RIFF0000WEBP"), "image/webp");
    await db.insert(expense).values({
      userId: abandoned,
      merchant: "Test",
      amountCents: 100,
      spentOn: "2026-10-01",
      category: "Other",
      receiptPath: receiptKey,
    });
    await db.insert(schedulerProfile).values({ userId: abandoned, handle: id("handle"), displayName: "T", timeZone: "UTC" });
    const shared = await makeBoard(abandoned, "Shared with a real user");
    await db.insert(boardMember).values([
      { boardId: shared, userId: otherGuest, role: "editor" },
      { boardId: shared, userId: real, role: "viewer" },
    ]);
    const guestOnly = await makeBoard(abandoned, "Only guests here");
    await db.insert(boardMember).values({ boardId: guestOnly, userId: otherGuest, role: "editor" });

    // Orphaned files: one old enough to sweep, one too fresh to touch.
    const oldOrphan = `receipts/${id("orphans")}/old.webp`;
    const freshOrphan = `receipts/${id("orphans")}/fresh.webp`;
    await saveFile(oldOrphan, Buffer.from("x"), "image/webp");
    await saveFile(freshOrphan, Buffer.from("x"), "image/webp");
    const oldTime = ago(3);
    await utimes(path.join(process.cwd(), ".data", "uploads", oldOrphan), oldTime, oldTime);

    const report = await runCleanup({ now, batchSize: 100_000 });

    const remaining = (await db.select({ id: user.id }).from(user).where(inArray(user.id, userIds))).map((u) => u.id);
    expect(remaining.sort()).toEqual([active, brandNew, otherGuest, real].sort());

    // The shared board now belongs to the real member, who is no longer listed as a member.
    const [rescued] = await db.select({ ownerId: board.ownerId }).from(board).where(eq(board.id, shared));
    expect(rescued.ownerId).toBe(real);
    expect(await db.select().from(boardMember).where(eq(boardMember.userId, real))).toHaveLength(0);
    // A board with no real member went with its owner.
    expect(await db.select().from(board).where(eq(board.id, guestOnly))).toHaveLength(0);

    expect(await db.select().from(expense).where(eq(expense.userId, abandoned))).toHaveLength(0);
    expect(await db.select().from(schedulerProfile).where(eq(schedulerProfile.userId, abandoned))).toHaveLength(0);

    const files = (await listFiles("receipts/")).map((f) => f.key);
    expect(files).not.toContain(receiptKey);
    expect(files).not.toContain(oldOrphan);
    expect(files).toContain(freshOrphan);

    expect(report.guestsDeleted).toBeGreaterThanOrEqual(1);
    expect(report.boardsHandedOver).toBeGreaterThanOrEqual(1);
    expect(report.receiptsDeleted).toBeGreaterThanOrEqual(1);
    expect(report.orphansDeleted).toBeGreaterThanOrEqual(1);
  });

  it("is safe to run again with nothing to do", async () => {
    const before = await db.select({ id: user.id }).from(user).where(inArray(user.id, userIds));
    await runCleanup({ now, batchSize: 100_000 });
    const after = await db.select({ id: user.id }).from(user).where(inArray(user.id, userIds));
    expect(after).toEqual(before);
  });
});
