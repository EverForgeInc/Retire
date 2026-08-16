import { describe, expect, it } from "vitest";
import { compareLocationCash, estimateRetiredPay } from "@/lib/rules/income";

describe("income calculations", () => {
  it("estimates high-3 retired pay", () => {
    expect(estimateRetiredPay(8000, 20, 0.025)).toBe(4000);
  });

  it("computes remaining cash and ratios", () => {
    const result = compareLocationCash(
      {
        estimatedRetiredPay: 5000,
        memberVaPay: 3000,
        spouseVaPay: 0,
        civilianIncome: 0,
        otherIncome: 0,
      },
      { rent: 1800, food: 900, miscellaneous: 300 },
    );
    expect(result.totalMonthlyIncome).toBe(8000);
    expect(result.totalMonthlyExpenses).toBe(3000);
    expect(result.remainingMonthlyCash).toBe(5000);
    expect(result.remainingAnnualCash).toBe(60000);
  });
});
