import { describe, expect, it } from "vitest";
import { buildIcs } from "./ics";

const base = {
  uid: "abc@amjadscorner.us",
  start: new Date("2030-01-07T14:00:00Z"),
  end: new Date("2030-01-07T14:30:00Z"),
  title: "Intro call, with Amjad; 30 min",
  organizer: { name: "Amjad", email: "host@example.com" },
  attendee: { name: "Sam", email: "sam@example.com" },
  sequence: 0,
};

describe("buildIcs", () => {
  it("builds a valid request with escaped text and CRLF line endings", () => {
    const ics = buildIcs(base, new Date("2030-01-01T00:00:00Z"));
    expect(ics).toContain("METHOD:REQUEST\r\n");
    expect(ics).toContain("DTSTART:20300107T140000Z\r\n");
    expect(ics).toContain("SUMMARY:Intro call\\, with Amjad\; 30 min\r\n");
    expect(ics).toContain("DTSTAMP:20300101T000000Z");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
  });

  it("folds long lines", () => {
    const ics = buildIcs({ ...base, description: "x".repeat(200) });
    expect(ics).toContain("\r\n x");
  });

  it("marks cancellations", () => {
    const ics = buildIcs({ ...base, sequence: 1, cancelled: true });
    expect(ics).toContain("METHOD:CANCEL");
    expect(ics).toContain("STATUS:CANCELLED");
    expect(ics).toContain("SEQUENCE:1");
  });
});
