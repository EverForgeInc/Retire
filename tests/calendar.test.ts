import { describe, expect, it } from "vitest";
import { buildMonthGrid, federalHolidaysForYear, resolveDayKind } from "@/lib/rules/calendar";
import { parseDateOnly } from "@/lib/rules/date-engine";

describe("transition calendar fills", () => {
  const events = [
    {
      eventType: "skillbridge" as const,
      title: "SkillBridge",
      startDate: parseDateOnly("2027-04-01"),
      endDate: parseDateOnly("2027-05-15"),
    },
    {
      eventType: "ptdy" as const,
      title: "PTDY",
      startDate: parseDateOnly("2027-05-18"),
      endDate: parseDateOnly("2027-05-21"),
    },
    {
      eventType: "terminal_leave" as const,
      title: "Terminal Leave",
      startDate: parseDateOnly("2027-05-22"),
      endDate: parseDateOnly("2027-05-31"),
      chargeableLeave: true,
    },
    {
      eventType: "retirement_ceremony" as const,
      title: "Retirement Ceremony",
      startDate: parseDateOnly("2027-05-29"),
      endDate: parseDateOnly("2027-05-29"),
    },
    {
      eventType: "retirement" as const,
      title: "Retirement Date",
      startDate: parseDateOnly("2027-06-01"),
      endDate: parseDateOnly("2027-06-01"),
    },
  ];

  it("marks Memorial Day 2027 as a federal holiday", () => {
    const holidays = federalHolidaysForYear(2027);
    const memorial = holidays.find((h) => h.name === "Memorial Day");
    expect(memorial?.date.toISOString().slice(0, 10)).toBe("2027-05-31");
  });

  it("prefers terminal leave over weekend fills", () => {
    const resolved = resolveDayKind(parseDateOnly("2027-05-23"), events, []);
    expect(resolved.primary).toBe("terminal_leave");
  });

  it("keeps ceremony star on terminal leave day", () => {
    const resolved = resolveDayKind(parseDateOnly("2027-05-29"), events, []);
    expect(resolved.primary).toBe("terminal_leave");
    expect(resolved.showStar).toBe("ceremony");
  });

  it("builds a May 2027 grid including SkillBridge and PTDY cells", () => {
    const grid = buildMonthGrid({ month: parseDateOnly("2027-05-01"), events });
    const may15 = grid.find((c) => c.dateKey === "2027-05-15");
    const may19 = grid.find((c) => c.dateKey === "2027-05-19");
    const june1 = grid.find((c) => c.dateKey === "2027-06-01");
    expect(may15?.primary).toBe("skillbridge");
    expect(may19?.primary).toBe("ptdy");
    expect(june1?.inMonth).toBe(false);
  });
});
