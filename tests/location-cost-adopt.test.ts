import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMemberContext: vi.fn(),
  writeAudit: vi.fn(),
  provider: { getMonthlyCosts: vi.fn() },
  prisma: {
    savedLocation: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, requireMemberContext: mocks.requireMemberContext };
});
vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/audit", () => ({ writeAudit: mocks.writeAudit }));
vi.mock("@/lib/providers/cost-of-living-data", async () => {
  const actual = await vi.importActual<typeof import("@/lib/providers/cost-of-living-data")>("@/lib/providers/cost-of-living-data");
  return { ...actual, freeUsWebCostProvider: mocks.provider };
});

import { POST as adoptCosts } from "@/app/api/location-cost-adopt/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireMemberContext.mockResolvedValue({ profile: { id: "member-a" }, session: { userId: "user-a" } });
});

describe("location cost adoption", () => {
  it("refuses to adopt costs for another member's saved location", async () => {
    mocks.prisma.savedLocation.findFirst.mockResolvedValue(null);

    const response = await adoptCosts(new Request("http://localhost/api/location-cost-adopt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedLocationId: "location-b" }),
    }));

    expect(response.status).toBe(404);
    expect(mocks.prisma.savedLocation.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "location-b", memberProfileId: "member-a" },
    }));
    expect(mocks.provider.getMonthlyCosts).not.toHaveBeenCalled();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
    expect(mocks.writeAudit).not.toHaveBeenCalled();
  });
});
