import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Positions are fractional-index keys (see board/_lib/position.ts); always order them
// with COLLATE "C" so Postgres compares bytes like JavaScript does.

const createdAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const board = pgTable("board", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// The owner is implicit (board.ownerId); members are everyone else with access.
export const boardRoles = ["editor", "viewer"] as const;
export type BoardRole = (typeof boardRoles)[number];

export const boardMember = pgTable(
  "board_member",
  {
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: boardRoles }).notNull(),
    createdAt,
  },
  (t) => [
    primaryKey({ columns: [t.boardId, t.userId] }),
    index("board_member_user_idx").on(t.userId),
    check("board_member_role", sql`${t.role} in ('editor', 'viewer')`),
  ],
);

export const boardInvite = pgTable(
  "board_invite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    role: text("role", { enum: boardRoles }).notNull(),
    // SHA-256 of the secret in the invite link; the secret itself is never stored.
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt,
  },
  (t) => [
    index("board_invite_board_idx").on(t.boardId),
    check("board_invite_role", sql`${t.role} in ('editor', 'viewer')`),
  ],
);

export const boardColumn = pgTable(
  "board_column",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: text("position").notNull(),
    createdAt,
  },
  (t) => [index("board_column_board_idx").on(t.boardId)],
);

export const boardCard = pgTable(
  "board_card",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    columnId: uuid("column_id")
      .notNull()
      .references(() => boardColumn.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    position: text("position").notNull(),
    // Bumped on every content edit; edits must send the version they started from.
    version: integer("version").notNull().default(1),
    // Soft delete so "Undo" can restore a card.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("board_card_board_idx").on(t.boardId),
    index("board_card_column_idx").on(t.columnId),
  ],
);
