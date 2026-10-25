import { describe, expect, it } from "vitest";
import { computeSlots, formatTimeOfDay, isValidTimeZone, parseTimeOfDay, type SlotInput } from "./slots";

const weekdays9to12 = [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMinute: 540, endMinute: 720 }));

function input(overrides: Partial<SlotInput> = {}): SlotInput {
  return {
    timeZone: "America/New_York",
    rules: weekdays9to12,
    overrides: [],
    durationMinutes: 60,
    bufferMinutes: 0,
    minNoticeMinutes: 0,
    maxDaysAhead: 1,
    busy: [],
    // Monday 2030-01-07 00:00 in New York (UTC-5)
    now: new Date("2030-01-07T05:00:00Z"),
    ...overrides,
  };
}

describe("computeSlots", () => {
  it("returns hourly slots inside weekly hours, in UTC", () => {
    expect(computeSlots(input())).toEqual([
      "2030-01-07T14:00:00.000Z",
      "2030-01-07T15:00:00.000Z",
      "2030-01-07T16:00:00.000Z",
    ]);
  });

  it("skips weekends", () => {
    // Saturday 2030-01-05
    expect(computeSlots(input({ now: new Date("2030-01-05T05:00:00Z") }))).toEqual([]);
  });

  it("drops slots before the minimum notice", () => {
    const slots = computeSlots(input({ now: new Date("2030-01-07T14:30:00Z"), minNoticeMinutes: 60 }));
    expect(slots[0]).toBe("2030-01-07T16:00:00.000Z");
  });

  it("blocks slots that overlap a booking, including the new slot's buffer", () => {
    const slots = computeSlots(
      input({
        bufferMinutes: 15,
        busy: [{ start: new Date("2030-01-07T16:00:00Z"), end: new Date("2030-01-07T17:00:00Z") }],
      }),
    );
    // 10:00–11:00 local + 15 min buffer runs into the 11:00 booking.
    expect(slots).toEqual(["2030-01-07T14:00:00.000Z"]);
  });

  it("lets a slot start exactly when a busy range ends", () => {
    const slots = computeSlots(
      input({ busy: [{ start: new Date("2030-01-07T14:00:00Z"), end: new Date("2030-01-07T15:00:00Z") }] }),
    );
    expect(slots).toEqual(["2030-01-07T15:00:00.000Z", "2030-01-07T16:00:00.000Z"]);
  });

  it("uses date overrides instead of weekly rules", () => {
    expect(computeSlots(input({ overrides: [{ date: "2030-01-07", startMinute: null, endMinute: null }] }))).toEqual([]);
    expect(
      computeSlots(input({ overrides: [{ date: "2030-01-07", startMinute: 780, endMinute: 840 }] })),
    ).toEqual(["2030-01-07T18:00:00.000Z"]);
  });

  it("keeps local wall-clock times across a DST change", () => {
    // US DST starts Sunday 2030-03-10; Monday 9:00 is UTC-4 instead of UTC-5.
    const slots = computeSlots(input({ now: new Date("2030-03-08T05:00:00Z"), maxDaysAhead: 4 }));
    expect(slots).toContain("2030-03-08T14:00:00.000Z"); // Friday 9:00 EST
    expect(slots).toContain("2030-03-11T13:00:00.000Z"); // Monday 9:00 EDT
  });

  it("handles a window crossing the skipped hour on DST day without duplicates", () => {
    const sunday = [{ weekday: 7, startMinute: 60, endMinute: 240 }]; // 01:00–04:00
    const slots = computeSlots(input({ rules: sunday, now: new Date("2030-03-10T05:00:00Z") }));
    // 02:00 doesn't exist that night; it shifts to 03:00 and must not appear twice.
    expect(slots).toEqual(["2030-03-10T06:00:00.000Z", "2030-03-10T07:00:00.000Z"]);
  });

  it("stops at maxDaysAhead", () => {
    const slots = computeSlots(input({ maxDaysAhead: 7 }));
    expect(slots.at(-1)! <= "2030-01-14T05:00:00.000Z").toBe(true);
    expect(slots).toHaveLength(15); // Mon 7th through Fri 11th, plus Mon 14th is past the limit
  });
});

describe("time helpers", () => {
  it("parses and formats times of day", () => {
    expect(parseTimeOfDay("09:30")).toBe(570);
    expect(parseTimeOfDay("24:00")).toBe(1440);
    expect(parseTimeOfDay("24:30")).toBeNull();
    expect(parseTimeOfDay("9:30")).toBeNull();
    expect(formatTimeOfDay(570)).toBe("09:30");
  });

  it("validates time zones", () => {
    expect(isValidTimeZone("Europe/London")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
  });
});
