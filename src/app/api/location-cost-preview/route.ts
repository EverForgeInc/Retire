import { handleRouteError, jsonError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { freeUsWebCostProvider } from "@/lib/providers/cost-of-living-data";

export async function GET(request: Request) {
  try {
    const { profile } = await requireMemberContext();
    const url = new URL(request.url);
    const savedLocationId = url.searchParams.get("savedLocationId");
    if (!savedLocationId) return jsonError("savedLocationId is required", 400);

    const saved = await prisma.savedLocation.findFirst({
      where: { id: savedLocationId, memberProfileId: profile.id },
    });
    if (!saved) return jsonError("Location not found", 404);
    if (saved.countryCode.toUpperCase() !== "US") {
      return jsonOk({
        supported: false,
        reason: "The current free web prototype is limited to U.S. locations while international reuse permissions are evaluated.",
        costs: [],
      });
    }

    const costs = await freeUsWebCostProvider.getMonthlyCosts({
      city: saved.city,
      state: saved.state ?? undefined,
      country: saved.country,
      countryCode: saved.countryCode,
    });

    if (costs.length === 0) {
      return jsonOk({
        supported: true,
        available: false,
        reason: "No usable cost values were found for this city. Manual costs remain unchanged.",
        costs: [],
      });
    }

    return jsonOk({
      supported: true,
      available: true,
      experimental: true,
      attribution: "CostOfLivingData.com (CC BY 4.0; underlying public/federal data where noted)",
      costs: costs.map((cost) => ({
        category: cost.category,
        amountUsd: cost.amountUsd ?? cost.amountLocal,
        currency: cost.currency,
        source: cost.source,
        retrievedAt: cost.retrievedAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
