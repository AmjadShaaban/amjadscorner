import { describe, expect, it } from "vitest";
import { locate, moveAfter, moveToIndex, placement, removeCard, type Columns } from "./board-state";

const card = (id: string) => ({ id, title: id, description: null, version: 1 });
const board = (): Columns => [
  { id: "todo", title: "To do", cards: [card("a"), card("b"), card("c")] },
  { id: "done", title: "Done", cards: [card("d")] },
  { id: "empty", title: "Empty", cards: [] },
];
const ids = (cols: Columns) => Object.fromEntries(cols.map((c) => [c.id, c.cards.map((x) => x.id).join("")]));

describe("board state", () => {
  it("reorders within a column", () => {
    expect(ids(moveToIndex(board(), "a", "todo", 2))).toMatchObject({ todo: "bca" });
    expect(ids(moveToIndex(board(), "c", "todo", 0))).toMatchObject({ todo: "cab" });
  });

  it("moves across columns, including into an empty one", () => {
    expect(ids(moveToIndex(board(), "b", "done", 0))).toEqual({ todo: "ac", done: "bd", empty: "" });
    expect(ids(moveToIndex(board(), "b", "empty", 0))).toMatchObject({ todo: "ac", empty: "b" });
  });

  it("clamps out-of-range indexes and ignores unknown ids", () => {
    expect(ids(moveToIndex(board(), "a", "done", 99))).toMatchObject({ done: "da" });
    expect(moveToIndex(board(), "zzz", "done", 0)).toEqual(board());
    expect(moveToIndex(board(), "a", "nope", 0)).toEqual(board());
  });

  it("round-trips a move through placement + moveAfter (what undo does)", () => {
    const start = board();
    const before = placement(start, "b")!;
    expect(before).toEqual({ columnId: "todo", afterCardId: "a" });
    const moved = moveToIndex(start, "b", "done", 1);
    expect(ids(moveAfter(moved, "b", before.columnId, before.afterCardId))).toEqual(ids(start));
  });

  it("puts a card first when its anchor is gone", () => {
    expect(ids(moveAfter(removeCard(board(), "a"), "c", "todo", "a"))).toMatchObject({ todo: "cb" });
  });

  it("locates cards", () => {
    expect(locate(board(), "d")).toMatchObject({ columnId: "done", index: 0 });
    expect(locate(board(), "x")).toBeNull();
  });
});
