import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A labelled form control. The control sits inside its <label> (implicit association)
 * instead of using id/htmlFor: Next keeps visited pages mounted but hidden, and
 * duplicate ids across those pages would point labels at the hidden copy.
 */
export function FormField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <label className="grid gap-1.5">
        <span className="text-sm leading-none font-medium select-none">{label}</span>
        {children}
      </label>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const nativeSelectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";
