import { describe, expect, it } from "vitest";
import { isValidPosition, positionBetween, positionsAfter } from "./position";

describe("positionBetween", () => {
  it("creates first, appended and prepended keys", () => {
    const first = positionBetween(null, null);
    const after = positionBetween(first, null);
    const before = positionBetween(null, first);
    expect(before < first && first < after).toBe(true);
  });

  it("finds keys between adjacent digits by going deeper", () => {
    const k = positionBetween("a", "b");
    expect(k > "a" && k < "b").toBe(true);
    const k2 = positionBetween("a", "a1");
    expect(k2 > "a" && k2 < "a1").toBe(true);
  });

  it("handles a prefix of zeros in the upper bound", () => {
    const k = positionBetween("1", "105");
    expect(k > "1" && k < "105").toBe(true);
  });

  it("rejects reversed, equal or malformed bounds", () => {
    expect(() => positionBetween("b", "a")).toThrow();
    expect(() => positionBetween("a", "a")).toThrow();
    expect(() => positionBetween("a0", null)).toThrow();
    expect(() => positionBetween("A", null)).toThrow();
  });

  it("stays strictly ordered and valid under thousands of random inserts", () => {
    // Deterministic PRNG for a reproducible property test.
    let seed = 7;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
    const keys: string[] = [positionBetween(null, null)];
    for (let i = 0; i < 5000; i++) {
      const at = Math.floor(rand() * (keys.length + 1));
      const key = positionBetween(keys[at - 1] ?? null, keys[at] ?? null);
      keys.splice(at, 0, key);
    }
    for (let i = 1; i < keys.length; i++) expect(keys[i - 1] < keys[i]).toBe(true);
    expect(keys.every(isValidPosition)).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps keys short for the common append and prepend cases", () => {
    const appended = positionsAfter(null, 500); // the per-board card limit
    expect(Math.max(...appended.map((k) => k.length))).toBeLessThanOrEqual(16);
    let k = positionBetween(null, null);
    for (let i = 0; i < 200; i++) k = positionBetween(null, k);
    expect(k.length).toBeLessThanOrEqual(10);
  });
});
