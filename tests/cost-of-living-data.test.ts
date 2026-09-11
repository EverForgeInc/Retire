import { describe, expect, it } from "vitest";
import { parseCostOfLivingDataPage } from "@/lib/providers/cost-of-living-data";

describe("CostOfLivingData web parser", () => {
  it("extracts the monthly summary categories used by the prototype", () => {
    const html = `
      <main>
        <div>Rent <span>median rent</span> <strong>$1,094</strong></div>
        <div>Groceries <span>national estimate</span> <strong>$400</strong></div>
        <div>Utilities <span>local estimate</span> <strong>$88</strong></div>
        <div>Transportation <span>local gas prices</span> <strong>$126</strong></div>
        <div>Estimated Total <strong>$1,708/mo</strong></div>
      </main>
    `;
    const result = parseCostOfLivingDataPage(html, "https://costoflivingdata.com/test", new Date("2026-09-11T00:00:00Z"));
    expect(Object.fromEntries(result.map((item) => [item.category, item.amountUsd]))).toEqual({
      housing: 1094,
      groceries: 400,
      utilities: 88,
      transportation: 126,
      estimated_total: 1708,
    });
    expect(result.every((item) => item.currency === "USD")).toBe(true);
  });

  it("returns only categories that can be verified from the page", () => {
    const result = parseCostOfLivingDataPage("<p>Estimated Total $2,500/mo</p>", "https://costoflivingdata.com/test");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("estimated_total");
  });
});
