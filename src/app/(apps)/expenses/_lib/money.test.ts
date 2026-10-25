import { describe, expect, it } from "vitest";
import { csvRow } from "./csv";
import { formatMoney, formatMoneyCompact, formatMoneyWhole, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it("parses common inputs", () => {
    expect(parseAmountToCents("12")).toBe(1200);
    expect(parseAmountToCents("12.5")).toBe(1250);
    expect(parseAmountToCents("$1,234.56")).toBe(123456);
    expect(parseAmountToCents(" 0.99 ")).toBe(99);
  });

  it("rejects zero, negatives, extra decimals and junk", () => {
    for (const bad of ["0", "-5", "1.234", "abc", "", "1e5"]) expect(parseAmountToCents(bad)).toBeNull();
  });
});

describe("formatting", () => {
  it("formats money", () => {
    expect(formatMoney(123456)).toBe("$1,234.56");
    expect(formatMoneyCompact(95000)).toBe("$950");
    expect(formatMoneyCompact(120000)).toBe("$1.2K");
    expect(formatMoneyWhole(100401)).toBe("$1,004");
  });
});

describe("csvRow", () => {
  it("quotes commas and quotes, and neutralises formulas", () => {
    expect(csvRow(["a,b", 'say "hi"', 3, null])).toBe('"a,b","say ""hi""",3,');
    expect(csvRow(["=HYPERLINK(1)", "+1", "@SUM", "-2"])).toBe("'=HYPERLINK(1),'+1,'@SUM,'-2");
  });
});
