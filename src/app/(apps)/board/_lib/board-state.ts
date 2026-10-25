import type { BoardCardView, BoardColumnView } from "./data";

// Pure helpers over the client's view of a board, shared by drag-and-drop,
// optimistic updates and undo.

export type Columns = BoardColumnView[];
export type Card = BoardCardView;

export function locate(columns: Columns, cardId: string) {
  for (const column of columns) {
    const index = column.cards.findIndex((c) => c.id === cardId);
    if (index !== -1) return { columnId: column.id, index, card: column.cards[index] };
  }
  return null;
}

/** The card's column and the card right above it: what moveCard needs to put it back. */
export function placement(columns: Columns, cardId: string) {
  const at = locate(columns, cardId);
  if (!at) return null;
  const column = columns.find((c) => c.id === at.columnId)!;
  return { columnId: at.columnId, afterCardId: column.cards[at.index - 1]?.id ?? null };
}

/** Moves a card to `index` within `toColumnId` (index counted without the card itself). */
export function moveToIndex(columns: Columns, cardId: string, toColumnId: string, index: number): Columns {
  const at = locate(columns, cardId);
  if (!at || !columns.some((c) => c.id === toColumnId)) return columns;
  const without = columns.map((c) => (c.id === at.columnId ? { ...c, cards: c.cards.filter((x) => x.id !== cardId) } : c));
  return without.map((c) => {
    if (c.id !== toColumnId) return c;
    const cards = [...c.cards];
    cards.splice(Math.max(0, Math.min(index, cards.length)), 0, at.card);
    return { ...c, cards };
  });
}

/** Moves a card to sit right after `afterCardId` in `toColumnId` (first if null or missing). */
export function moveAfter(columns: Columns, cardId: string, toColumnId: string, afterCardId: string | null): Columns {
  const column = columns.find((c) => c.id === toColumnId);
  if (!column) return columns;
  const others = column.cards.filter((c) => c.id !== cardId);
  const anchor = afterCardId ? others.findIndex((c) => c.id === afterCardId) : -1;
  return moveToIndex(columns, cardId, toColumnId, anchor + 1);
}

export function removeCard(columns: Columns, cardId: string): Columns {
  return columns.map((c) => ({ ...c, cards: c.cards.filter((x) => x.id !== cardId) }));
}

export function updateCard(columns: Columns, cardId: string, patch: Partial<Card>): Columns {
  return columns.map((c) => ({ ...c, cards: c.cards.map((x) => (x.id === cardId ? { ...x, ...patch } : x)) }));
}

export function appendCard(columns: Columns, columnId: string, card: Card): Columns {
  return columns.map((c) => (c.id === columnId ? { ...c, cards: [...c.cards, card] } : c));
}
