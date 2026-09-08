import { describe, expect, it } from "vitest";
import { csvEscape } from "@/lib/rules/csv";
import { handleRouteError, PublicApiError } from "@/lib/api";
import { assertNoSsnFields } from "@/lib/validation";
import { savedLocationSchema } from "@/lib/validation";
import { unavailableGeocodingProvider, unavailableCostOfLivingProvider } from "@/lib/providers/location";
import { readFileSync } from "fs";
import path from "path";

describe("privacy guards", () => {
  it("neutralizes spreadsheet formulas in CSV exports", () => {
    expect(csvEscape("=HYPERLINK(\"https://example.test\")")).toBe('"\'=HYPERLINK(""https://example.test"")"');
    expect(csvEscape("+1")).toBe("'+1");
    expect(csvEscape("-1")).toBe("'-1");
    expect(csvEscape("@cmd")).toBe("'@cmd");
    expect(csvEscape('normal, "quoted"')).toBe('"normal, ""quoted"""');
  });

  it("keeps manual locations and unavailable provider values explicit", async () => {
    const location = savedLocationSchema.parse({
      city: "Anywhere",
      country: "United States",
      countryCode: "us",
      currency: "usd",
      manualCosts: { housing: 1800 },
    });
    expect(location).toMatchObject({ countryCode: "US", currency: "USD", manualCosts: { housing: 1800 } });
    expect(await unavailableGeocodingProvider.geocode({ city: location.city, country: location.country, countryCode: location.countryCode })).toBeNull();
    expect(await unavailableCostOfLivingProvider.getMonthlyCosts({ city: location.city, country: location.country, countryCode: location.countryCode })).toEqual([]);
  });
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

  it("keeps medical-transition notes out of audit payloads", () => {
    const route = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "medical-transition", "route.ts"),
      "utf8",
    );
    expect(route).not.toMatch(/afterValue:\s*data/);
    expect(route).not.toMatch(/afterValue:[\s\S]*notes/);
    expect(route).toMatch(/eventType/);
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

  it("rejects self-references for secondary VA conditions", () => {
    const route = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "va-conditions", "[id]", "route.ts"),
      "utf8",
    );
    expect(route).toMatch(/secondaryConditionId === id/);
    expect(route).toMatch(/not found/i);
  });

  it("prevents cross-member VA condition access", () => {
    const route = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "va-conditions", "[id]", "route.ts"),
      "utf8",
    );
    expect(route).toMatch(/memberProfileId: profile\.id/);
    expect(route).toMatch(/getOwnedCondition/);
  });

  it("has authenticated member-owned location CRUD routes", () => {
    const locRoute = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "locations", "route.ts"),
      "utf8",
    );
    const locIdRoute = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "locations", "[id]", "route.ts"),
      "utf8",
    );
    expect(locRoute).toMatch(/memberProfileId: profile\.id/);
    expect(locRoute).toMatch(/requireMemberContext/);
    expect(locIdRoute).toMatch(/memberProfileId: profile\.id/);
    expect(locIdRoute).toMatch(/export async function DELETE/);
    expect(locIdRoute).toMatch(/export async function PUT/);
  });

  it("prevents location access across members", () => {
    const locRoute = readFileSync(
      path.join(process.cwd(), "src", "app", "api", "locations", "[id]", "route.ts"),
      "utf8",
    );
    expect(locRoute).toMatch(/where:.*id.*memberProfileId: profile\.id/);
  });

  it("preserves task update in-app without file download", () => {
    const workbench = readFileSync(
      path.join(process.cwd(), "src", "components", "checklist", "ChecklistWorkbench.tsx"),
      "utf8",
    );
    expect(workbench).toMatch(/fetch.*\/api\/tasks/);
    expect(workbench).toMatch(/method:.*PATCH/);
    expect(workbench).toMatch(/router\.refresh/);
  });

  it("exports remain explicit and separate from normal actions", () => {
    const settings = readFileSync(
      path.join(process.cwd(), "src", "app", "settings", "page.tsx"),
      "utf8",
    );
    expect(settings).toMatch(/href=.*\/api\/exports/);
    expect(settings).toMatch(/download/);
    expect(settings).not.toMatch(/normal.*export|automatic.*export/i);
  });
});

  it("does not expose internal route errors", async () => {
    const internal = handleRouteError(new Error("AUTH_SECRET is not configured"));
    expect(internal.status).toBe(500);
    await expect(internal.json()).resolves.toEqual({ error: "Unexpected server error" });

    const publicError = handleRouteError(new PublicApiError("Referenced condition was not found for this member"));
    expect(publicError.status).toBe(400);
  });
