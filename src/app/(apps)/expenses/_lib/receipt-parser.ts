import type { ExpenseCategory } from "@/db/schema/expenses";

export type ParsedReceipt = {
  merchant?: string;
  totalCents?: number;
  date?: string; // YYYY-MM-DD
  category?: ExpenseCategory;
};

// "1,234.56", "$12.30", "12,30" (comma decimals from OCR or EU receipts)
const AMOUNT = /(?:^|[^\d.,])\$?\s?(\d{1,3}(?:,\d{3})+|\d+)[.,](\d{2})(?![\d])/g;

function amountsIn(line: string): number[] {
  const found: number[] = [];
  for (const m of line.matchAll(AMOUNT)) {
    found.push(Number(m[1].replace(/,/g, "")) * 100 + Number(m[2]));
  }
  return found;
}

const TOTAL_LABELS: [RegExp, number][] = [
  [/\bgrand\s*total\b/i, 3],
  [/\b(amount|balance|total)\s*due\b/i, 2],
  [/\btotal\b/i, 1],
];
const NOT_TOTAL = /sub\s*-?\s*total|\btax\b|saving|discount|you\s+saved|\bitems?\b|tip\s*suggest/i;
const NOT_SPEND = /\bchange\b|\bcash\b|tender|\bpaid\b|\bauth|\bapproval|\bref\b/i;

function findTotal(lines: string[]): number | undefined {
  let best: { cents: number; rank: number } | undefined;
  for (const line of lines) {
    if (NOT_TOTAL.test(line)) continue;
    const rank = TOTAL_LABELS.find(([re]) => re.test(line))?.[1];
    if (!rank) continue;
    const cents = amountsIn(line).at(-1);
    if (cents === undefined) continue;
    if (!best || rank > best.rank || (rank === best.rank && cents > best.cents)) best = { cents, rank };
  }
  if (best) return best.cents;

  // No labelled total: the largest amount that isn't cash handed over or change.
  const candidates = lines.filter((l) => !NOT_SPEND.test(l)).flatMap(amountsIn);
  return candidates.length ? Math.max(...candidates) : undefined;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function isoDate(y: number, m: number, d: number): string | undefined {
  if (y < 100) y += 2000;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return undefined;
  return date.toISOString().slice(0, 10);
}

function findDate(text: string, today: Date): string | undefined {
  const candidates: string[] = [];
  for (const m of text.matchAll(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) {
    const iso = isoDate(+m[1], +m[2], +m[3]);
    if (iso) candidates.push(iso);
  }
  for (const m of text.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})\b/g)) {
    const [a, b, y] = [+m[1], +m[2], +m[3]];
    // US order by default; if the first number can't be a month, read it as day-first.
    const iso = a > 12 ? isoDate(y, b, a) : isoDate(y, a, b);
    if (iso) candidates.push(iso);
  }
  for (const m of text.matchAll(/\b([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/gi)) {
    const month = MONTHS.indexOf(m[1].toLowerCase()) + 1;
    const iso = month ? isoDate(+m[3], month, +m[2]) : undefined;
    if (iso) candidates.push(iso);
  }
  for (const m of text.matchAll(/\b(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})\b/gi)) {
    const month = MONTHS.indexOf(m[2].toLowerCase()) + 1;
    const iso = month ? isoDate(+m[3], month, +m[1]) : undefined;
    if (iso) candidates.push(iso);
  }

  // Reject OCR misreads: nothing in the future or more than ten years back.
  const max = new Date(today.getTime() + 86_400_000).toISOString().slice(0, 10);
  const min = new Date(Date.UTC(today.getUTCFullYear() - 10, 0, 1)).toISOString().slice(0, 10);
  return candidates.find((d) => d >= min && d <= max);
}

const NOT_MERCHANT =
  /receipt|invoice|welcome|thank|tel\b|phone|www\.|https?:|\.com\b|order\s*#|store\s*#|cashier|\d{3}[-.)\s]+\d{3}[-.\s]+\d{4}/i;

function findMerchant(lines: string[]): string | undefined {
  for (const line of lines.slice(0, 6)) {
    const letters = line.replace(/[^a-z]/gi, "").length;
    if (letters < 3 || letters / line.replace(/\s/g, "").length < 0.6 || NOT_MERCHANT.test(line)) continue;
    const cleaned = line.replace(/[^\p{L}\p{N}&'.\- ]/gu, "").trim();
    if (!cleaned) continue;
    // ALL-CAPS headers read better in title case.
    const name =
      cleaned === cleaned.toUpperCase()
        ? cleaned.toLowerCase().replace(/(^|[\s\-&])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase())
        : cleaned;
    return name.slice(0, 80);
  }
  return undefined;
}

const CATEGORY_KEYWORDS: [ExpenseCategory, RegExp][] = [
  ["Groceries", /grocer|market|whole\s*foods|trader\s*joe|kroger|safeway|aldi|costco|walmart|publix|wegmans|produce/i],
  ["Dining", /restaurant|cafe|café|coffee|starbucks|pizza|burger|grill|bistro|kitchen|bar\b|diner|taco|sushi|server:|table\s*\d|gratuity/i],
  ["Transport", /\bgas\b|fuel|shell|chevron|exxon|\bbp\b|uber|lyft|parking|transit|metro|taxi|toll|gallons?/i],
  ["Health", /pharmacy|cvs|walgreens|clinic|dental|medical|\brx\b|optical/i],
  ["Entertainment", /cinema|theat(er|re)|movie|ticket|concert|museum|bowling|netflix|spotify|steam/i],
  ["Travel", /hotel|airline|airways|airbnb|motel|inn\b|resort|baggage|boarding/i],
  ["Bills", /utility|electric|water\s*bill|internet|wireless|verizon|comcast|at&t|insurance|invoice/i],
  ["Shopping", /target|amazon|best\s*buy|ikea|mall|store|outlet|apparel|clothing|home\s*depot|lowe'?s/i],
];

export function guessCategory(text: string): ExpenseCategory | undefined {
  return CATEGORY_KEYWORDS.find(([, re]) => re.test(text))?.[0];
}

/** Best-effort extraction from OCR text. Every field is optional; the user reviews before saving. */
export function parseReceipt(text: string, today = new Date()): ParsedReceipt {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const merchant = findMerchant(lines);
  return {
    merchant,
    totalCents: findTotal(lines),
    date: findDate(text, today),
    category: guessCategory(`${merchant ?? ""}\n${text}`),
  };
}
