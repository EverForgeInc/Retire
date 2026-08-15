import { describe, expect, it } from "vitest";
import { detectOverlaps, inclusiveDayCount, projectLeaveBalance } from "@/lib/rules/leave";

describe("leave planner rules", () => {
  it("counts inclusive days", () => {
    expect(inclusiveDayCount(new Date("2027-05-22T00:00:00"), new Date("2027-05-31T00:00:00"))).toBe(10);
  });

  it("detects overlaps", () => {
    const conflicts = detectOverlaps([
      {
        eventType: "skillbridge",
        title: "SkillBridge",
        startDate: new Date("2027-03-01T00:00:00"),
        endDate: new Date("2027-05-15T00:00:00"),
      },
      {
        eventType: "terminal_leave",
        title: "Terminal Leave",
        startDate: new Date("2027-05-01T00:00:00"),
        endDate: new Date("2027-05-31T00:00:00"),
      },
    ]);
    expect(conflicts.length).toBe(1);
  });

  it("flags use-or-lose projections", () => {
    const result = projectLeaveBalance({
      currentBalance: 55,
      accrualPerMonth: 2.5,
      monthsRemaining: 6,
      chargeableDaysUsed: 0,
    });
    expect(result.useOrLoseWarning).toBe(true);
  });
});
