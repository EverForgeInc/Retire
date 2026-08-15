import { describe, expect, it } from "vitest";
import {
  calculateAllSectionWindows,
  daysAfter,
  daysBefore,
  getSectionWindowById,
  parseDateOnly,
  toDateOnly,
} from "@/lib/rules/date-engine";

describe("date engine (retirement 2027-06-01)", () => {
  const rd = "2027-06-01";

  it("computes 180 days before as 2026-12-03", () => {
    expect(toDateOnly(daysBefore(parseDateOnly(rd), 180))).toBe("2026-12-03");
  });

  it("computes 90 days before as 2027-03-03", () => {
    expect(toDateOnly(daysBefore(parseDateOnly(rd), 90))).toBe("2027-03-03");
  });

  it("computes 30 days after as 2027-07-01", () => {
    expect(toDateOnly(daysAfter(parseDateOnly(rd), 30))).toBe("2027-07-01");
  });

  it("uses calendar-month arithmetic for month windows", () => {
    const window = getSectionWindowById(rd, "section_01");
    expect(toDateOnly(window.start)).toBe("2025-06-01");
    expect(window.end ? toDateOnly(window.end) : null).toBe("2025-12-01");
  });

  it("returns 14 chronological sections", () => {
    expect(calculateAllSectionWindows(rd)).toHaveLength(14);
  });

  it("matches acceptance window for 180-121 days", () => {
    const window = getSectionWindowById(rd, "section_05");
    expect(toDateOnly(window.start)).toBe("2026-12-03");
    expect(window.end ? toDateOnly(window.end) : null).toBe("2027-01-31");
  });
});
