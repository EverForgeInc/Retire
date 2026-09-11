import { describe, expect, it } from "vitest";
import { parseWorldBankPriceLevelResponse } from "@/lib/providers/world-bank-price-level";

describe("World Bank price-level benchmark", () => {
  it("uses the latest numeric observation", () => {
    const result = parseWorldBankPriceLevelResponse([
      { page: 1 },
      [
        { country: { value: "Exampleland" }, date: "2025", value: 72.4 },
        { country: { value: "Exampleland" }, date: "2024", value: 70.1 },
      ],
    ], "EX", "https://api.worldbank.org/test", new Date("2026-09-11T00:00:00Z"));

    expect(result).toMatchObject({
      countryCode: "EX",
      countryName: "Exampleland",
      value: 72.4,
      year: 2025,
      license: "CC BY 4.0",
    });
  });

  it("skips null observations and returns null when no usable value exists", () => {
    const result = parseWorldBankPriceLevelResponse([{ page: 1 }, [{ date: "2025", value: null }]], "EX", "source");
    expect(result).toBeNull();
  });
});
