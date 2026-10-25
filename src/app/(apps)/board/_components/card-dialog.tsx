"use client";

import { TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCard } from "../_actions/board";
import type { Card } from "../_lib/board-state";

type Props = {
  boardId: string;
  card: Card | null;
  canEdit: boolean;
  onClose: () => void;
  onSaved: (card: Card) => void;
  onDelete: (card: Card) => void;
};

export function CardDialog({ card, onClose, ...rest }: Props) {
  return (
    <Dialog open={card !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {/* Keyed so each opened card starts from its own values. */}
        {card && <CardEditor key={`${card.id}:${card.version}`} card={card} onClose={onClose} {...rest} />}
      </DialogContent>
    </Dialog>
  );
}

function CardEditor({ boardId, card, canEdit, onClose, onSaved, onDelete }: Omit<Props, "card"> & { card: Card }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [version, setVersion] = useState(card.version);
  const [conflict, setConflict] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateCard(boardId, card.id, { title, description, version });
      if (result.ok) {
        onSaved({ id: card.id, title: title.trim(), description: description.trim() || null, version: version + 1 });
        onClose();
      } else if ("conflict" in result) {
        // Show their version; the user can re-apply their change and save again.
        setTitle(result.conflict.title);
        setDescription(result.conflict.description ?? "");
        setVersion(result.conflict.version);
        setConflict(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (!canEdit) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="break-words">{card.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{card.description || "No description."}</p>
      </>
    );
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <DialogHeader>
        <DialogTitle>Edit card</DialogTitle>
      </DialogHeader>
      {conflict && (
        <p role="alert" className="rounded-md bg-amber-500/10 p-2 text-sm text-amber-700 dark:text-amber-400">
          {conflict}
        </p>
      )}
      <FormField label="Title">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </FormField>
      <FormField label="Description">
        <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
      </FormField>
      <DialogFooter className="sm:justify-between">
        <Button type="button" variant="ghost" className="text-destructive" onClick={() => onDelete(card)}>
          <TrashIcon /> Delete
        </Button>
        <Button type="submit" disabled={pending || !title.trim()}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
