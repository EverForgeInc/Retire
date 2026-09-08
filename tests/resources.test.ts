import { describe, expect, it } from "vitest";
import { RESOURCE_LINKS } from "@/lib/resources";

describe("resource hub", () => {
  it("includes trusted official links for transition planning", () => {
    expect(RESOURCE_LINKS.length).toBeGreaterThan(5);
    expect(RESOURCE_LINKS.some((item) => item.label === "VA.gov")).toBe(true);
    expect(RESOURCE_LINKS.some((item) => item.label === "Military OneSource")).toBe(true);
    expect(RESOURCE_LINKS.some((item) => item.label === "DFAS")).toBe(true);
    expect(RESOURCE_LINKS.every((item) => item.href.startsWith("https://"))).toBe(true);
  });
});
