import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const requireMemberContext = vi.fn();
  const writeAudit = vi.fn();
  const prisma = {
  vaCondition: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  vaFunctionalLimitation: { deleteMany: vi.fn() },
  savedLocation: {
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
  };
  return { requireMemberContext, writeAudit, prisma };
});

const { requireMemberContext, writeAudit, prisma } = mocks;

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, requireMemberContext: mocks.requireMemberContext };
});
vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/audit", () => ({ writeAudit: mocks.writeAudit }));

import { GET as getConditions, POST as createCondition } from "@/app/api/va-conditions/route";
import { DELETE as deleteCondition, PUT as updateCondition } from "@/app/api/va-conditions/[id]/route";
import { DELETE as deleteLocation, PUT as updateLocation } from "@/app/api/locations/[id]/route";

const member = { id: "member-a" };
const session = { userId: "user-a" };
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  requireMemberContext.mockResolvedValue({ profile: member, session });
  prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => unknown) => callback(prisma));
});

describe("member-owned API boundaries", () => {
  it("scopes VA reads to the authenticated member", async () => {
    prisma.vaCondition.findMany.mockResolvedValue([]);

    const response = await getConditions();

    expect(response.status).toBe(200);
    expect(prisma.vaCondition.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { memberProfileId: member.id },
    }));
  });

  it("refuses VA updates and deletes for another member's condition", async () => {
    prisma.vaCondition.findFirst.mockResolvedValue(null);

    const updateResponse = await updateCondition(
      new Request("http://localhost", { method: "PUT", body: JSON.stringify({ conditionName: "Changed" }) }),
      params("condition-b"),
    );
    const deleteResponse = await deleteCondition(new Request("http://localhost", { method: "DELETE" }), params("condition-b"));

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
    expect(prisma.vaCondition.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "condition-b", memberProfileId: member.id },
    }));
    expect(prisma.vaCondition.update).not.toHaveBeenCalled();
    expect(prisma.vaCondition.delete).not.toHaveBeenCalled();
  });

  it("rejects a secondary reference owned by another member", async () => {
    prisma.vaCondition.findFirst.mockResolvedValue(null);

    const response = await createCondition(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        conditionName: "Secondary condition",
        memberPrimaryTheory: "secondary",
        secondaryConditionId: "00000000-0000-0000-0000-000000000002",
      }),
    }));

    expect(response.status).toBe(400);
    expect(prisma.vaCondition.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "00000000-0000-0000-0000-000000000002", memberProfileId: member.id },
    }));
    expect(prisma.vaCondition.create).not.toHaveBeenCalled();
  });

  it("refuses saved-location updates and deletes for another member", async () => {
    prisma.savedLocation.findFirst.mockResolvedValue(null);

    const payload = {
      city: "Anywhere",
      country: "United States",
      countryCode: "US",
      currency: "USD",
    };
    const updateResponse = await updateLocation(
      new Request("http://localhost", { method: "PUT", body: JSON.stringify(payload) }),
      params("location-b"),
    );
    const deleteResponse = await deleteLocation(new Request("http://localhost", { method: "DELETE" }), params("location-b"));

    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
    expect(prisma.savedLocation.findFirst).toHaveBeenCalledWith({
      where: { id: "location-b", memberProfileId: member.id },
    });
    expect(prisma.savedLocation.update).not.toHaveBeenCalled();
    expect(prisma.savedLocation.delete).not.toHaveBeenCalled();
  });

  it("blocks deleting a condition referenced by another condition", async () => {
    prisma.vaCondition.findFirst.mockResolvedValue({ id: "condition-a", memberProfileId: member.id });
    prisma.vaCondition.count.mockResolvedValue(1);

    const response = await deleteCondition(new Request("http://localhost", { method: "DELETE" }), params("condition-a"));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("references it") });
    expect(prisma.vaCondition.delete).not.toHaveBeenCalled();
    expect(writeAudit).not.toHaveBeenCalled();
  });
});
