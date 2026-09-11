import { describe, expect, it } from "vitest";
import { parseOecdPriceLevelCsv } from "@/lib/providers/oecd-price-level-categories";

describe("OECD international COL category parser", () => {
  it("selects the latest valid price-level observation", () => {
    const csv = [
      "REF_AREA,FREQ,MEASURE,ANALYTICAL_CATEGORY,BASE_PER,TIME_PERIOD,OBS_VALUE",
      "JPN,A,PL,A0104,OECD,2022,92.4",
      "JPN,A,PL,A0104,OECD,2024,95.7",
      "JPN,A,PL,A0104,OECD,2023,94.1",
    ].join("\n");
    const result = parseOecdPriceLevelCsv(csv, "housing", "Housing, water, electricity, gas and other fuels", "https://example.test", new Date("2026-09-11T00:00:00Z"));
    expect(result).toMatchObject({ category: "housing", value: 95.7, year: 2024, base: "OECD" });
  });

  it("returns null when the response has no usable observations", () => {
    const csv = "REF_AREA,TIME_PERIOD,OBS_VALUE\nJPN,2024,";
    expect(parseOecdPriceLevelCsv(csv, "food", "Food", "https://example.test")).toBeNull();
  });
});
