// Fractional indexing: each card/column has a string key, and order is plain string
// order. Moving an item computes a key strictly between its new neighbours, so only
// the moved row is written. Keys are base-36 fractions ("0.<digits>" without the "0.")
// and never end in "0", which guarantees there is always room below any key.
//
// Ordering must be by byte value: compare with < in JS and use COLLATE "C" in Postgres.

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const BASE = DIGITS.length;

function digit(c: string | undefined): number {
  if (c === undefined) return 0;
  const i = DIGITS.indexOf(c);
  if (i === -1) throw new Error(`Invalid position key character: ${c}`);
  return i;
}

export function isValidPosition(key: string): boolean {
  return /^[0-9a-z]+$/.test(key) && !key.endsWith("0");
}

/**
 * A key strictly between `a` and `b`. `null` means "start of list" for a and
 * "end of list" for b.
 */
export function positionBetween(a: string | null, b: string | null): string {
  const lo = a ?? "";
  if (a !== null && !isValidPosition(a)) throw new Error(`Invalid position key: ${a}`);
  if (b !== null && !isValidPosition(b)) throw new Error(`Invalid position key: ${b}`);
  if (b !== null && lo >= b) throw new Error(`Position ${a} is not before ${b}`);
  // An empty list starts in the middle, leaving room on both sides.
  if (a === null && b === null) return DIGITS[BASE / 2];

  // Skip the shared prefix (treating missing trailing digits of `lo` as zeros).
  let n = 0;
  if (b !== null) while ((lo[n] ?? "0") === b[n]) n++;
  const prefix = b === null ? lo.slice(0, n) : b.slice(0, n);

  const dLo = digit(lo[n]);
  const dHi = b === null ? BASE : digit(b[n]);

  if (dHi - dLo > 1) {
    // Appending or prepending (one side open): step by one digit so repeated appends
    // grow keys by ~1 char per 18–35 items instead of halving the gap every time.
    if (b === null) return prefix + DIGITS[dLo + 1];
    if (a === null) return prefix + DIGITS[dHi - 1];
    // Otherwise take the middle digit.
    return prefix + DIGITS[Math.floor((dLo + dHi) / 2)];
  }
  // Adjacent digits, but b continues: b cut short is still above a and below b.
  if (b !== null && b.length > n + 1) return b.slice(0, n + 1);
  // Otherwise keep a's digit and go one level deeper with no upper bound. When that
  // level is empty, start at its far end so further appends/prepends get the most room.
  const rest = lo.slice(n + 1);
  if (rest) return prefix + DIGITS[dLo] + positionBetween(rest, null);
  return prefix + DIGITS[dLo] + (a === null ? DIGITS[BASE - 1] : DIGITS[1]);
}

/** Keys for `count` items appended after `last` (null for an empty list). */
export function positionsAfter(last: string | null, count: number): string[] {
  const keys: string[] = [];
  let prev = last;
  for (let i = 0; i < count; i++) keys.push((prev = positionBetween(prev, null)));
  return keys;
}
