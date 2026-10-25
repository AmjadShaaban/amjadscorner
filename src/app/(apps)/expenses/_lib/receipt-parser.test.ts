import { describe, expect, it } from "vitest";
import { guessCategory, parseReceipt } from "./receipt-parser";

const today = new Date("2026-10-25T12:00:00Z");

describe("parseReceipt", () => {
  it("reads a typical grocery receipt", () => {
    const text = `WHOLE FOODS MARKET
      123 Main St, Austin TX
      (512) 555-0100
      ORGANIC BANANAS     1.99
      ALMOND MILK         4.49
      SUBTOTAL            6.48
      TAX                 0.53
      TOTAL               7.01
      VISA ****1234       7.01
      10/21/2026 14:32`;
    expect(parseReceipt(text, today)).toEqual({
      merchant: "Whole Foods Market",
      totalCents: 701,
      date: "2026-10-21",
      category: "Groceries",
    });
  });

  it("prefers grand total and amount due over plain total lines", () => {
    const text = `Bistro 21\nFood total 40.00\nTip 8.00\nGrand Total $48.00\nOct 3, 2026`;
    const r = parseReceipt(text, today);
    expect(r.totalCents).toBe(4800);
    expect(r.date).toBe("2026-10-03");
    expect(r.category).toBe("Dining");
  });

  it("ignores subtotal, tax, savings and cash tendered", () => {
    const text = `SHOP\nSubtotal 90.00\nTotal Savings 10.00\nTotal 99.50\nCash 100.00\nChange 0.50`;
    expect(parseReceipt(text, today).totalCents).toBe(9950);
  });

  it("falls back to the largest non-cash amount when there's no total label", () => {
    const text = `Corner Store\nItem A 3.00\nItem B 12.25\n15.25\nCash 20.00\nChange 4.75`;
    expect(parseReceipt(text, today).totalCents).toBe(1525);
  });

  it("handles thousands separators and comma decimals", () => {
    expect(parseReceipt("Hotel\nTotal $1,234.56", today).totalCents).toBe(123456);
    expect(parseReceipt("Cafe\nTOTAL 12,30", today).totalCents).toBe(1230);
  });

  it("reads day-first, ISO and named-month dates", () => {
    expect(parseReceipt("x\n25/09/2026", today).date).toBe("2026-09-25");
    expect(parseReceipt("x\n2026-08-14", today).date).toBe("2026-08-14");
    expect(parseReceipt("x\n7 Sep 2026", today).date).toBe("2026-09-07");
    expect(parseReceipt("x\n10/02/26", today).date).toBe("2026-10-02");
  });

  it("rejects impossible and future dates", () => {
    expect(parseReceipt("x\n02/30/2026", today).date).toBeUndefined();
    expect(parseReceipt("x\n12/25/2030", today).date).toBeUndefined();
  });

  it("skips address, phone and boilerplate lines when picking a merchant", () => {
    const text = `*** RECEIPT ***\nWelcome!\n555-123-4567\nJoe's Coffee & Co.\nLatte 4.50`;
    expect(parseReceipt(text, today).merchant).toBe("Joe's Coffee & Co.");
  });

  it("returns empty fields for unreadable text", () => {
    expect(parseReceipt("~~ ## 1 2", today)).toEqual({
      merchant: undefined,
      totalCents: undefined,
      date: undefined,
      category: undefined,
    });
  });
});

describe("guessCategory", () => {
  it("maps known merchants", () => {
    expect(guessCategory("SHELL OIL 57442")).toBe("Transport");
    expect(guessCategory("CVS/pharmacy #1234")).toBe("Health");
    expect(guessCategory("Mystery Shop")).toBeUndefined();
  });
});
