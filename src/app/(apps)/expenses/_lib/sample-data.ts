import type { ExpenseCategory } from "@/db/schema/expenses";
import { addMonths } from "./months";

type Template = { merchant: string; category: ExpenseCategory; min: number; max: number; perMonth: number };

const templates: Template[] = [
  { merchant: "Whole Foods Market", category: "Groceries", min: 4500, max: 14000, perMonth: 4 },
  { merchant: "Trader Joe's", category: "Groceries", min: 2500, max: 7000, perMonth: 2 },
  { merchant: "Blue Bottle Coffee", category: "Dining", min: 450, max: 1200, perMonth: 5 },
  { merchant: "Tacodeli", category: "Dining", min: 1400, max: 4200, perMonth: 3 },
  { merchant: "Shell", category: "Transport", min: 3500, max: 6500, perMonth: 2 },
  { merchant: "Uber", category: "Transport", min: 1200, max: 3800, perMonth: 2 },
  { merchant: "Austin Energy", category: "Bills", min: 9000, max: 16000, perMonth: 1 },
  { merchant: "Spectrum Internet", category: "Bills", min: 7999, max: 7999, perMonth: 1 },
  { merchant: "Target", category: "Shopping", min: 2000, max: 11000, perMonth: 1 },
  { merchant: "Alamo Drafthouse", category: "Entertainment", min: 2400, max: 5200, perMonth: 1 },
  { merchant: "CVS Pharmacy", category: "Health", min: 900, max: 4500, perMonth: 1 },
];

// Deterministic PRNG so the demo looks the same every time.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** About 23 expenses a month for the six months ending with `lastMonth`, none after `today`. */
export function sampleExpenses(lastMonth: string, today: string) {
  const rand = mulberry32(42);
  const rows: { merchant: string; category: ExpenseCategory; amountCents: number; spentOn: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = addMonths(lastMonth, -i);
    const [y, m] = month.split("-").map(Number);
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (const t of templates) {
      for (let n = 0; n < t.perMonth; n++) {
        const day = 1 + Math.floor(rand() * days);
        const spentOn = `${month}-${String(day).padStart(2, "0")}`;
        if (spentOn > today) continue;
        rows.push({
          merchant: t.merchant,
          category: t.category,
          amountCents: Math.round(t.min + rand() * (t.max - t.min)),
          spentOn,
        });
      }
    }
  }
  // One trip in the middle month makes the trend chart worth reading.
  rows.push({ merchant: "Hotel Emma", category: "Travel", amountCents: 48900, spentOn: `${addMonths(lastMonth, -2)}-14` });
  return rows;
}
