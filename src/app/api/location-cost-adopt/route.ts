import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { freeUsWebCostProvider, planningCostsFromPreview } from "@/lib/providers/cost-of-living-data";

const SOURCE_TYPE = "web_cc_by_4";
const SOURCE_PROVENANCE = "CostOfLivingData.com compilation, CC BY 4.0; experimental web import";

export async function POST(request: Request) {
  try {
    const { profile, session } = await requireMemberContext();
    const body = await request.json();
    const savedLocationId = typeof body.savedLocationId === "string" ? body.savedLocationId : "";
    if (!savedLocationId) return Response.json({ error: "savedLocationId is required" }, { status: 400 });

    const saved = await prisma.savedLocation.findFirst({
      where: { id: savedLocationId, memberProfileId: profile.id },
      include: { location: true },
    });
    if (!saved) return Response.json({ error: "Location not found" }, { status: 404 });
    if (!saved.locationId || !saved.location) return Response.json({ error: "Location is not linked to a planning record" }, { status: 409 });
    if (saved.countryCode.toUpperCase() !== "US") {
      return Response.json({ error: "The free web provider currently supports U.S. locations only" }, { status: 422 });
    }

    const preview = await freeUsWebCostProvider.getMonthlyCosts({
      city: saved.city,
      state: saved.state ?? undefined,
      country: saved.country,
      countryCode: saved.countryCode,
    });
    const planningCosts = planningCostsFromPreview(preview);
    if (planningCosts.length === 0) {
      return Response.json({ error: "No verified itemized costs were available to import" }, { status: 422 });
    }

    const now = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.locationCostVersion.deleteMany({
        where: { locationId: saved.locationId!, sourceType: SOURCE_TYPE, isManualOverride: false },
      });
      for (const cost of planningCosts) {
        await tx.locationCostVersion.create({
          data: {
            locationId: saved.locationId!,
            effectiveDate: cost.retrievedAt,
            category: cost.category,
            amountLocal: cost.amountLocal,
            amountUsd: cost.amountUsd,
            sourceType: SOURCE_TYPE,
            sourceUrl: cost.source,
            sourceDate: cost.retrievedAt,
            lastVerified: cost.retrievedAt,
            confidence: "experimental",
            approved: true,
            provenance: SOURCE_PROVENANCE,
            lastUpdated: now,
            isManualOverride: false,
          },
        });
      }
    });

    await writeAudit({
      userId: session.userId,
      memberProfileId: profile.id,
      entityType: "location_cost",
      entityId: saved.locationId,
      action: "web_costs_adopted",
      afterValue: {
        savedLocationId: saved.id,
        categories: planningCosts.map((cost) => cost.category),
        source: planningCosts[0]?.source,
        retrievedAt: planningCosts[0]?.retrievedAt,
      },
    });

    return jsonOk({
      adopted: planningCosts.map((cost) => ({
        category: cost.category,
        amountUsd: cost.amountUsd,
        currency: cost.currency,
        source: cost.source,
        retrievedAt: cost.retrievedAt,
      })),
      referenceTotal: preview.find((cost) => cost.category === "estimated_total")?.amountUsd ?? null,
      note: "Itemized categories were adopted for planning. The source estimated total remains reference-only to prevent double counting.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
