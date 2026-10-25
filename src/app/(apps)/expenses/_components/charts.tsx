"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatMoney, formatMoneyCompact, formatMoneyWhole } from "../_lib/money";
import { formatMonth } from "../_lib/months";

// Single-series charts in the --viz-series hue (validated against both card surfaces).
// Specs: bars ≤ 24px thick, 4px rounded data-end, square at the baseline; 1px solid
// gridlines; selective direct labels; hover/focus tooltip per mark; a table view.

/** Round an axis max up to 1, 2, 2.5 or 5 × 10ⁿ so ticks land on clean numbers. */
export function niceMax(value: number, ticks = 4): number {
  if (value <= 0) return ticks;
  const raw = value / ticks;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw)!;
  return step * ticks;
}

function Tooltip({ value, label }: { value: string; label: string }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md"
    >
      <div className="font-semibold text-foreground">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function DataTable({ caption, rows }: { caption: string; rows: [string, string][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show as table</summary>
      <table className="mt-2 w-full">
        <caption className="sr-only">{caption}</caption>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b last:border-0">
              <th scope="row" className="py-1 text-left font-normal">
                {k}
              </th>
              <td className="py-1 text-right tabular-nums">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

const PLOT_HEIGHT = 176;

export function MonthlyColumns({ data, selected }: { data: { month: string; cents: number }[]; selected: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.cents)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <figure>
      <div className="flex gap-2">
        {/* y-axis ticks */}
        <div className="relative w-12 shrink-0 text-right text-xs text-muted-foreground tabular-nums" style={{ height: PLOT_HEIGHT }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: (t / max) * PLOT_HEIGHT }}>
              {formatMoneyCompact(t)}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <div className="relative" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 h-px"
                style={{
                  bottom: (t / max) * PLOT_HEIGHT,
                  background: t === 0 ? "var(--viz-axis)" : "var(--viz-grid)",
                }}
              />
            ))}
            <div className="absolute inset-0 flex">
              {data.map((d) => {
                const height = (d.cents / max) * PLOT_HEIGHT;
                const isSelected = d.month === selected;
                return (
                  // The whole band is the hit target, not just the painted column.
                  <Link
                    key={d.month}
                    href={`/expenses?month=${d.month}`}
                    aria-label={`${formatMonth(d.month)}: ${formatMoney(d.cents)}`}
                    className="group relative flex flex-1 flex-col items-center justify-end outline-none"
                    onPointerEnter={() => setHovered(d.month)}
                    onPointerLeave={() => setHovered(null)}
                    onFocus={() => setHovered(d.month)}
                    onBlur={() => setHovered(null)}
                  >
                    {/* Label and tooltip ride the top of the column, not the top of the band. */}
                    <div className="relative flex flex-col items-center">
                      {hovered === d.month && <Tooltip value={formatMoney(d.cents)} label={formatMonth(d.month)} />}
                      {isSelected && d.cents > 0 && (
                        <span className="mb-1 text-xs font-medium text-foreground tabular-nums">
                          {formatMoneyWhole(d.cents)}
                        </span>
                      )}
                    </div>
                    <div
                      className="w-6 max-w-full rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-ring"
                      style={{ height: Math.max(height, d.cents > 0 ? 2 : 0), background: "var(--viz-series)" }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
          {/* x-axis band sits outside the plot height so it's never clipped */}
          <div className="mt-1.5 flex text-xs">
            {data.map((d) => (
              <span
                key={d.month}
                className={cn(
                  "flex-1 text-center",
                  d.month === selected ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {formatMonth(d.month, "short")}
              </span>
            ))}
          </div>
        </div>
      </div>
      <DataTable
        caption="Monthly spending"
        rows={data.map((d) => [formatMonth(d.month), formatMoney(d.cents)])}
      />
    </figure>
  );
}

export function CategoryBars({ data }: { data: { category: string; cents: number; count: number }[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.cents, 0);
  const max = Math.max(...data.map((d) => d.cents));

  return (
    <figure>
      <ul className="grid gap-2">
        {data.map((d) => (
          <li
            key={d.category}
            tabIndex={0}
            aria-label={`${d.category}: ${formatMoney(d.cents)}, ${d.count} ${d.count === 1 ? "expense" : "expenses"}`}
            className="group grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-sm text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onPointerEnter={() => setHovered(d.category)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(d.category)}
            onBlur={() => setHovered(null)}
          >
            <span className="truncate text-muted-foreground">{d.category}</span>
            <div className="flex items-center gap-2">
              <div className="relative h-5" style={{ width: `${(d.cents / max) * 80}%`, minWidth: 2 }}>
                {hovered === d.category && (
                  <Tooltip
                    value={formatMoney(d.cents)}
                    label={`${Math.round((d.cents / total) * 100)}% · ${d.count} ${d.count === 1 ? "expense" : "expenses"}`}
                  />
                )}
                <div
                  className="h-full rounded-r-[4px] transition-opacity group-hover:opacity-80"
                  style={{ background: "var(--viz-series)" }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums">{formatMoneyWhole(d.cents)}</span>
            </div>
          </li>
        ))}
      </ul>
      <DataTable caption="Spending by category" rows={data.map((d) => [d.category, formatMoney(d.cents)])} />
    </figure>
  );
}
