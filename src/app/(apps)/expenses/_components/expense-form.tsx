"use client";

import { CameraIcon, LoaderCircleIcon, ScanTextIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FormField, nativeSelectClass } from "@/components/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { expenseCategories } from "@/db/schema/expenses";
import { centsToInput } from "../_lib/money";
import { parseReceipt, type ParsedReceipt } from "../_lib/receipt-parser";
import type { FormState } from "../_lib/schemas";
import { prepareReceiptImage, recognizeText, type OcrProgress } from "./receipt-image";

type Initial = {
  merchant: string;
  amountCents: number | null;
  spentOn: string;
  category: string;
  notes: string;
  receiptUrl: string | null;
};

type Props = {
  initial: Initial;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
};

type Scan =
  | { phase: "idle" }
  | { phase: "working"; label: string; progress: number }
  | { phase: "done"; found: (keyof ParsedReceipt)[]; text: string }
  | { phase: "error"; message: string };

export function ExpenseForm({ initial, action, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, { ok: false });
  const [merchant, setMerchant] = useState(initial.merchant);
  const [amount, setAmount] = useState(initial.amountCents ? centsToInput(initial.amountCents) : "");
  const [spentOn, setSpentOn] = useState(initial.spentOn);
  const [category, setCategory] = useState(initial.category);
  const [notes, setNotes] = useState(initial.notes);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial.receiptUrl);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [scan, setScan] = useState<Scan>({ phase: "idle" });
  const [scanned, setScanned] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Next keeps this page mounted but hidden after navigating away. Start fresh on the
  // next visit instead of showing the last draft (cleanup runs when it's hidden).
  const initialRef = useRef(initial);
  useLayoutEffect(() => {
    initialRef.current = initial;
  });
  useLayoutEffect(() => {
    return () => {
      const i = initialRef.current;
      setMerchant(i.merchant);
      setAmount(i.amountCents ? centsToInput(i.amountCents) : "");
      setSpentOn(i.spentOn);
      setCategory(i.category);
      setNotes(i.notes);
      setReceipt(null);
      setPreview(i.receiptUrl);
      setRemoveReceipt(false);
      setScan({ phase: "idle" });
      setScanned(false);
    };
  }, []);

  useEffect(() => {
    if (state.message && !state.ok) toast.error(state.message);
  }, [state]);

  // Revoke object URLs we created for previews.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      setScan({ phase: "working", label: "Preparing image", progress: 0 });
      const { file: prepared, canvas } = await prepareReceiptImage(file);
      setReceipt(prepared);
      setRemoveReceipt(false);
      setPreview(URL.createObjectURL(prepared));

      const text = await recognizeText(canvas, ({ status, progress }: OcrProgress) =>
        setScan({
          phase: "working",
          label: status === "recognizing text" ? "Reading receipt" : "Loading text recognition",
          progress,
        }),
      );
      const parsed = parseReceipt(text);
      const found: (keyof ParsedReceipt)[] = [];
      if (parsed.merchant) {
        setMerchant(parsed.merchant);
        found.push("merchant");
      }
      if (parsed.totalCents) {
        setAmount(centsToInput(parsed.totalCents));
        found.push("totalCents");
      }
      if (parsed.date) {
        setSpentOn(parsed.date);
        found.push("date");
      }
      if (parsed.category) {
        setCategory(parsed.category);
        found.push("category");
      }
      setScanned(found.length > 0);
      setScan({ phase: "done", found, text });
    } catch (error) {
      setScan({ phase: "error", message: error instanceof Error ? error.message : "Couldn't read that image." });
    }
  }

  const errors = state.fieldErrors ?? {};
  const foundLabels: Record<keyof ParsedReceipt, string> = {
    merchant: "merchant",
    totalCents: "total",
    date: "date",
    category: "category",
  };

  return (
    <form
      action={(formData) => {
        if (receipt) formData.set("receipt", receipt);
        formAction(formData);
      }}
      className="grid gap-6 md:grid-cols-[1fr_16rem]"
    >
      <div className="grid content-start gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Merchant" error={errors.merchant?.[0]}>
            <Input name="merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} required maxLength={80} />
          </FormField>
          <FormField label="Amount (USD)" error={errors.amount?.[0]}>
            <Input
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Date" error={errors.spentOn?.[0]}>
            <Input name="spentOn" type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} required />
          </FormField>
          <FormField label="Category" error={errors.category?.[0]}>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={nativeSelectClass}
              required
            >
              <option value="" disabled>
                Pick one
              </option>
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Notes">
          <Textarea name="notes" rows={2} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
        <input type="hidden" name="scanned" value={String(scanned)} />
        <input type="hidden" name="removeReceipt" value={String(removeReceipt)} />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending || scan.phase === "working"}>
            {pending ? "Saving…" : submitLabel}
          </Button>
          <Link href="/expenses" className={buttonVariants({ variant: "ghost" })}>
            Cancel
          </Link>
        </div>
      </div>

      <div className="grid content-start gap-3">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label="Receipt photo"
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {preview && !removeReceipt ? (
          <div className="relative overflow-hidden rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: and auth-gated URLs */}
            <img src={preview} alt="Receipt" className="max-h-80 w-full object-contain" />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Remove receipt"
              className="absolute top-2 right-2"
              onClick={() => {
                setReceipt(null);
                setPreview(null);
                setRemoveReceipt(true);
                setScan({ phase: "idle" });
              }}
            >
              <XIcon />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <CameraIcon className="size-6" />
            <span className="font-medium text-foreground">Scan a receipt</span>
            <span>Text is read in your browser, never on a server.</span>
          </button>
        )}
        {preview && !removeReceipt && (
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <ScanTextIcon /> Scan a different receipt
          </Button>
        )}

        {scan.phase === "working" && (
          <div className="grid gap-1.5 text-sm" role="status" aria-live="polite">
            <span className="flex items-center gap-2">
              <LoaderCircleIcon className="size-4 animate-spin" /> {scan.label}…
            </span>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${Math.round(scan.progress * 100)}%` }} />
            </div>
          </div>
        )}
        {scan.phase === "done" && (
          <div className="text-sm" role="status">
            {scan.found.length ? (
              <p>
                Filled in the {scan.found.map((f) => foundLabels[f]).join(", ")}. <strong>Check them before saving.</strong>
              </p>
            ) : (
              <p className="text-muted-foreground">Couldn&apos;t find details on this receipt. Fill them in by hand.</p>
            )}
            <details className="mt-1">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">What was read</summary>
              <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">{scan.text}</pre>
            </details>
          </div>
        )}
        {scan.phase === "error" && <p className="text-sm text-destructive">{scan.message}</p>}
      </div>
    </form>
  );
}
