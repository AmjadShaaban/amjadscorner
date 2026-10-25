/** "$1,234.5" -> 123450. Returns null for anything that isn't a positive amount. */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "").replace(/,/g, "");
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents > 0 ? cents : null;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoney(cents: number): string {
  return usd.format(cents / 100);
}

const usdWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** For direct labels on marks: whole dollars, $1,004. */
export function formatMoneyWhole(cents: number): string {
  return usdWhole.format(Math.round(cents / 100));
}

/** For axis ticks: $950, $1.2K, $12K. */
export function formatMoneyCompact(cents: number): string {
  return cents < 100_000 ? usd.format(Math.round(cents / 100)).replace(/\.00$/, "") : usdCompact.format(cents / 100);
}
