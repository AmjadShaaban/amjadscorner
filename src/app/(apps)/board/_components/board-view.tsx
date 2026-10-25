"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeftIcon, ArrowRightIcon, EllipsisIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  addCard,
  addColumn,
  archiveCard,
  deleteColumn,
  moveCard,
  renameColumn,
  restoreCard,
  shiftColumn,
  type ActionResult,
} from "../_actions/board";
import {
  appendCard,
  locate,
  moveAfter,
  moveToIndex,
  placement,
  removeCard,
  updateCard,
  type Card,
  type Columns,
} from "../_lib/board-state";
import { CardDialog } from "./card-dialog";

type Op =
  | { type: "set"; columns: Columns }
  | { type: "remove"; cardId: string }
  | { type: "append"; columnId: string; card: Card }
  | { type: "update"; cardId: string; patch: Partial<Card> };

function reduce(state: Columns, op: Op): Columns {
  switch (op.type) {
    case "set":
      return op.columns;
    case "remove":
      return removeCard(state, op.cardId);
    case "append":
      return appendCard(state, op.columnId, op.card);
    case "update":
      return updateCard(state, op.cardId, op.patch);
  }
}

type UndoEntry = { cardId: string; columnId: string; afterCardId: string | null };

/** Other people's changes show up when you come back to the tab (no realtime in v2). */
function useRefreshOnFocus() {
  const router = useRouter();
  useEffect(() => {
    let last = Date.now();
    const onReturn = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 5000) return;
      last = Date.now();
      router.refresh();
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [router]);
}

const isTemp = (id: string) => id.startsWith("temp-");

export function BoardView({ boardId, columns, canEdit }: { boardId: string; columns: Columns; canEdit: boolean }) {
  useRefreshOnFocus();
  const [optimistic, apply] = useOptimistic(columns, reduce);
  // While dragging, a local copy tracks cross-column moves so the card follows the pointer.
  const [dragging, setDragging] = useState<Columns | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Card | null>(null);
  const [saving, startTransition] = useTransition();
  const origin = useRef<UndoEntry | null>(null);
  const undoStack = useRef<UndoEntry[]>([]);
  const latest = useRef(optimistic);
  useEffect(() => {
    latest.current = optimistic;
  });

  const view = dragging ?? optimistic;
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  });

  // Leaving mid-save would drop the change; ask first.
  useEffect(() => {
    if (!saving) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saving]);

  // The default sortable keyboard handling only moves within one list. Left/Right jump to
  // the neighbouring column instead (as in dnd-kit's multi-container example).
  const keyboardCoordinates = useCallback<KeyboardCoordinateGetter>((event, args) => {
    const { active, droppableRects, droppableContainers, collisionRect } = args.context;
    if ((event.code === "ArrowLeft" || event.code === "ArrowRight") && active && collisionRect) {
      event.preventDefault();
      const columns = viewRef.current;
      const current = locate(columns, String(active.id));
      const i = columns.findIndex((c) => c.id === current?.columnId);
      const target = columns[i + (event.code === "ArrowRight" ? 1 : -1)];
      // dnd-kit measures droppables asynchronously after pickup; if an arrow key comes
      // first, measure the target column directly instead of ignoring the key.
      const rect =
        target &&
        (droppableRects.get(target.id) ?? droppableContainers.get(target.id)?.node.current?.getBoundingClientRect());
      if (!rect) return undefined;
      return { x: rect.left + (rect.width - collisionRect.width) / 2, y: rect.top };
    }
    return sortableKeyboardCoordinates(event, args);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
      // Space picks up and drops; Enter is left free to open the card.
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    }),
  );

  function run(op: Op, action: () => Promise<ActionResult>) {
    startTransition(async () => {
      apply(op);
      const result = await action();
      if (!result.ok) toast.error(result.message);
    });
  }

  function commitMove(entry: UndoEntry, next: Columns) {
    run({ type: "set", columns: next }, () => moveCard(boardId, entry.cardId, entry.columnId, entry.afterCardId));
  }

  // ⌘Z / Ctrl+Z undoes the last move (outside text fields).
  useEffect(() => {
    if (!canEdit) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z" || e.shiftKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      const entry = undoStack.current.pop();
      if (!entry) return;
      e.preventDefault();
      commitMove(entry, moveAfter(latest.current, entry.cardId, entry.columnId, entry.afterCardId));
      toast("Move undone");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- commitMove reads refs and stable setters
  }, [canEdit, boardId]);

  const columnOf = (id: string, state: Columns) =>
    state.some((c) => c.id === id) ? { columnId: id, index: state.find((c) => c.id === id)!.cards.length } : locate(state, id);

  function onDragStart({ active }: DragStartEvent) {
    const id = String(active.id);
    setActiveId(id);
    const from = placement(optimistic, id);
    origin.current = from && { cardId: id, ...from };
    setDragging(optimistic);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over || !dragging) return;
    const id = String(active.id);
    const from = locate(dragging, id);
    const to = columnOf(String(over.id), dragging);
    if (!from || !to || from.columnId === to.columnId) return;
    setDragging(moveToIndex(dragging, id, to.columnId, to.index));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const id = String(active.id);
    let state = dragging ?? optimistic;
    const from = locate(state, id);
    const to = over ? columnOf(String(over.id), state) : null;
    if (from && to && from.columnId === to.columnId && String(over!.id) !== id) {
      state = moveToIndex(state, id, to.columnId, to.index);
    }
    setDragging(null);
    setActiveId(null);

    const final = placement(state, id);
    const start = origin.current;
    if (!final || !start || (final.columnId === start.columnId && final.afterCardId === start.afterCardId)) return;
    undoStack.current = [...undoStack.current.slice(-19), start];
    commitMove({ cardId: id, ...final }, state);
  }

  function archive(card: Card) {
    run({ type: "remove", cardId: card.id }, () => archiveCard(boardId, card.id));
    toast("Card deleted", {
      action: {
        label: "Undo",
        onClick: () =>
          startTransition(async () => {
            const result = await restoreCard(boardId, card.id);
            if (!result.ok) toast.error(result.message);
          }),
      },
    });
  }

  const titleOf = (id: string | number) => locate(view, String(id))?.card.title ?? "card";
  const placeOf = (id: string | number) => {
    const asColumn = view.find((c) => c.id === String(id));
    if (asColumn) return `the ${asColumn.title} column`;
    const at = locate(view, String(id));
    const column = at && view.find((c) => c.id === at.columnId);
    return column ? `${column.title}, position ${at.index + 1} of ${column.cards.length}` : "nowhere";
  };
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} is over ${placeOf(over.id)}.` : undefined),
    onDragEnd: ({ active }) => `Dropped ${titleOf(active.id)} in ${placeOf(active.id)}.`,
    onDragCancel: ({ active }) => `Moving ${titleOf(active.id)} was cancelled.`,
  };

  const activeCard = activeId ? locate(view, activeId)?.card : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable: "To move a card, press Space. Use the arrow keys to move it, Space to drop it, or Escape to cancel. Press Enter to open it.",
          },
        }}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setDragging(null);
          setActiveId(null);
        }}
      >
        {canEdit && (
          <p aria-live="polite" className="-mt-2 text-xs text-muted-foreground">
            {saving ? "Saving…" : "All changes saved"}
          </p>
        )}
        <div className="flex items-start gap-3 overflow-x-auto pb-4">
          {view.map((column, i) => (
            <ColumnView
              key={column.id}
              boardId={boardId}
              column={column}
              canEdit={canEdit}
              isFirst={i === 0}
              isLast={i === view.length - 1}
              onOpen={setEditing}
              onAdd={(title) => {
                const temp = { id: `temp-${crypto.randomUUID()}`, title, description: null, version: 0 };
                run({ type: "append", columnId: column.id, card: temp }, () => addCard(boardId, column.id, { title }));
              }}
            />
          ))}
          {canEdit && <AddColumnForm boardId={boardId} />}
        </div>
        <DragOverlay>{activeCard ? <CardFace card={activeCard} lifted /> : null}</DragOverlay>
      </DndContext>

      <CardDialog
        boardId={boardId}
        card={editing}
        canEdit={canEdit}
        onClose={() => setEditing(null)}
        onSaved={(card) => apply({ type: "update", cardId: card.id, patch: card })}
        onDelete={(card) => {
          setEditing(null);
          archive(card);
        }}
      />
    </>
  );
}

function ColumnView({
  boardId,
  column,
  canEdit,
  isFirst,
  isLast,
  onOpen,
  onAdd,
}: {
  boardId: string;
  column: Columns[number];
  canEdit: boolean;
  isFirst: boolean;
  isLast: boolean;
  onOpen: (card: Card) => void;
  onAdd: (title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, disabled: !canEdit });

  return (
    <section
      aria-label={column.title}
      className={cn("flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/60 p-2", isOver && "ring-2 ring-ring/40")}
    >
      <ColumnHeader boardId={boardId} column={column} canEdit={canEdit} isFirst={isFirst} isLast={isLast} />
      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-12 flex-col gap-2">
          {column.cards.map((card) => (
            <SortableCard key={card.id} card={card} canEdit={canEdit} onOpen={onOpen} />
          ))}
        </ul>
      </SortableContext>
      {canEdit && <AddCardForm onAdd={onAdd} />}
    </section>
  );
}

function ColumnHeader({
  boardId,
  column,
  canEdit,
  isFirst,
  isLast,
}: {
  boardId: string;
  column: Columns[number];
  canEdit: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const act = (fn: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) toast.error(result.message);
    });

  if (renaming) {
    return (
      <form
        className="px-1"
        onSubmit={(e) => {
          e.preventDefault();
          const title = String(new FormData(e.currentTarget).get("title") ?? "").trim();
          setRenaming(false);
          if (title && title !== column.title) act(() => renameColumn(boardId, column.id, { title }));
        }}
      >
        <Input
          name="title"
          aria-label="Column name"
          defaultValue={column.title}
          autoFocus
          maxLength={60}
          onBlur={(e) => e.currentTarget.form?.requestSubmit()}
          onKeyDown={(e) => e.key === "Escape" && setRenaming(false)}
        />
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1 px-1">
      <h2 className="flex-1 truncate text-sm font-semibold">
        {column.title} <span className="font-normal text-muted-foreground">{column.cards.length}</span>
      </h2>
      {canEdit && (
        <DropdownMenu onOpenChange={(open) => !open && setConfirmDelete(false)}>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={`${column.title} options`} disabled={pending} />}
          >
            <EllipsisIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setRenaming(true)}>Rename</DropdownMenuItem>
            <DropdownMenuItem disabled={isFirst} onClick={() => act(() => shiftColumn(boardId, column.id, -1))}>
              <ArrowLeftIcon /> Move left
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isLast} onClick={() => act(() => shiftColumn(boardId, column.id, 1))}>
              <ArrowRightIcon /> Move right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {confirmDelete ? (
              <DropdownMenuItem variant="destructive" onClick={() => act(() => deleteColumn(boardId, column.id))}>
                <TrashIcon /> Delete with {column.cards.length} {column.cards.length === 1 ? "card" : "cards"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                closeOnClick={false}
                onClick={() => (column.cards.length ? setConfirmDelete(true) : act(() => deleteColumn(boardId, column.id)))}
              >
                <TrashIcon /> Delete column
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function SortableCard({ card, canEdit, onOpen }: { card: Card; canEdit: boolean; onOpen: (card: Card) => void }) {
  const pendingSave = isTemp(card.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: !canEdit || pendingSave,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <div
        {...attributes}
        {...listeners}
        aria-roledescription={canEdit ? "draggable card" : "card"}
        aria-disabled={pendingSave || undefined}
        onClick={() => !pendingSave && onOpen(card)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !pendingSave) {
            e.preventDefault();
            onOpen(card);
            return;
          }
          listeners?.onKeyDown?.(e);
        }}
        className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CardFace card={card} dim={pendingSave} />
      </div>
    </li>
  );
}

function CardFace({ card, lifted, dim }: { card: Card; lifted?: boolean; dim?: boolean }) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border bg-card p-3 text-sm shadow-xs transition-shadow hover:shadow-sm",
        lifted && "rotate-1 cursor-grabbing shadow-lg",
        dim && "opacity-60",
      )}
    >
      <p className="break-words">{card.title}</p>
      {card.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.description}</p>}
    </div>
  );
}

function AddCardForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" onClick={() => setOpen(true)}>
        <PlusIcon /> Add card
      </Button>
    );
  }
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("title") as HTMLInputElement;
        const title = input.value.trim();
        if (title) onAdd(title);
        input.value = "";
        input.focus();
      }}
    >
      <Input
        name="title"
        aria-label="Card title"
        placeholder="What needs doing?"
        autoFocus
        maxLength={200}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
      <div className="flex gap-1">
        <Button type="submit" size="sm">
          Add
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Done
        </Button>
      </div>
    </form>
  );
}

function AddColumnForm({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button variant="outline" className="w-72 shrink-0 justify-start" onClick={() => setOpen(true)}>
        <PlusIcon /> Add column
      </Button>
    );
  }
  return (
    <form
      className="grid w-72 shrink-0 gap-2 rounded-xl bg-muted/60 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const title = String(new FormData(e.currentTarget).get("title") ?? "").trim();
        if (!title) return;
        startTransition(async () => {
          const result = await addColumn(boardId, { title });
          if (!result.ok) toast.error(result.message);
          else setOpen(false);
        });
      }}
    >
      <Input name="title" aria-label="Column name" placeholder="Column name" autoFocus maxLength={60} />
      <div className="flex gap-1">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add column"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
