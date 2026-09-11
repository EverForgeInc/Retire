import { handleRouteError, jsonError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { freeUsWebCostProvider } from "@/lib/providers/cost-of-living-data";
import { getWorldBankPriceLevelBenchmark } from "@/lib/providers/world-bank-price-level";

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
      const benchmark = await getWorldBankPriceLevelBenchmark(saved.countryCode);
      if (!benchmark) {
        return jsonOk({
          supported: true,
          available: false,
          reason: "No reusable international benchmark was available for this country. Manual costs remain unchanged.",
          costs: [],
          benchmark: null,
        });
      }
      return jsonOk({
        supported: true,
        available: true,
        experimental: true,
        attribution: "World Bank World Development Indicators · household final-consumption price level index · CC BY 4.0",
        costs: [],
        benchmark: {
          kind: "country_price_level_index",
          value: benchmark.value,
          year: benchmark.year,
          countryName: benchmark.countryName,
          source: benchmark.source,
          retrievedAt: benchmark.retrievedAt.toISOString(),
          license: benchmark.license,
          note: "Country-level comparison only. This is not a city-level monthly budget and is not imported into expenses.",
        },
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
