import { describe, expect, it } from "vitest";
import { assertNoSsnFields } from "@/lib/validation";
import { readFileSync } from "fs";
import path from "path";

describe("privacy guards", () => {
  it("rejects SSN-shaped payload keys", () => {
    expect(() => assertNoSsnFields({ last4: "1234" })).toThrow(/Forbidden field/);
    expect(() => assertNoSsnFields({ ssn: "123-45-6789" })).toThrow(/Forbidden field/);
  });

  it("allows normal profile payloads", () => {
    expect(() =>
      assertNoSsnFields({ fullName: "David Najera", projectedRetirementDate: "2027-06-01" }),
    ).not.toThrow();
  });

  it("prisma schema does not define ssn fields", () => {
    const schema = readFileSync(path.join(process.cwd(), "prisma", "schema.prisma"), "utf8");
    expect(schema.toLowerCase()).not.toMatch(/\bssn\b|last4|last_4|social.?security/);
  });

  it("does not expose medical upload UI copy as required", () => {
    const documents = readFileSync(
      path.join(process.cwd(), "src", "app", "documents", "page.tsx"),
      "utf8",
    );
    expect(documents).toMatch(/Medical-file uploads are disabled/);
    expect(documents).not.toMatch(/input type=\"file\".*medical/i);
  });

  it("keeps VA narratives out of audit payloads", () => {
    const route = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "va-conditions", "route.ts"),
      "utf8",
    );
    expect(route).not.toMatch(/afterValue:\s*data/);
    expect(route).toMatch(/conditionName/);
  });

  it("has member-owned VA update and delete routes", () => {
    const route = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "va-conditions", "[id]", "route.ts"),
      "utf8",
    );
    expect(route).toMatch(/memberProfileId: profile\.id/);
    expect(route).toMatch(/export async function PUT/);
    expect(route).toMatch(/export async function DELETE/);
    expect(route).toMatch(/secondaryConditionId === id/);
  });
});
