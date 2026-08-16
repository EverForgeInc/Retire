import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { compareLocationCash, estimateRetiredPay, VA_SCENARIO_RATINGS } from "@/lib/rules/income";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const scenarios = await prisma.incomeScenario.findMany({
      where: { memberProfileId: profile.id },
      include: {
        locations: {
          include: {
            location: {
              include: {
                costVersions: { where: { approved: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const approvedVa = await prisma.benefitRateVersion.findFirst({
      where: { benefitType: "va_compensation", status: "approved" },
      include: { vaCompensationRates: true },
      orderBy: { effectiveDate: "desc" },
    });

    const enriched = scenarios.map((scenario) => {
      const comparisons = scenario.locations.map((sel) => {
        const expensesFromCustom = JSON.parse(sel.customExpenses || "{}") as Record<string, number>;
        const expensesFromApproved = Object.fromEntries(
          sel.location.costVersions.map((c) => [c.category, c.amountUsd ?? 0]),
        );
        const expenses = { ...expensesFromApproved, ...expensesFromCustom };
        const result = compareLocationCash(
          {
            estimatedRetiredPay: scenario.estimatedRetiredPay ?? 0,
            memberVaPay: scenario.memberVaPay ?? 0,
            spouseVaPay: scenario.spouseVaPay ?? 0,
            civilianIncome: scenario.civilianIncome ?? 0,
            otherIncome: scenario.otherIncome ?? 0,
          },
          expenses,
        );
        return {
          locationId: sel.location.id,
          label: `${sel.location.city}${sel.location.region ? `, ${sel.location.region}` : ""}, ${sel.location.country}`,
          currency: sel.location.currency,
          expenses,
          ...result,
          provenance: {
            source: "approved_location_cost_versions + scenario overrides",
            confidence: "medium",
            userOverride: Object.keys(expensesFromCustom).length > 0,
          },
        };
      });

      comparisons.sort((a, b) => b.remainingMonthlyCash - a.remainingMonthlyCash);

      return {
        id: scenario.id,
        name: scenario.name,
        estimatedRetiredPay:
          scenario.estimatedRetiredPay ??
          (scenario.high3Monthly && scenario.yearsService && scenario.multiplier
            ? estimateRetiredPay(scenario.high3Monthly, scenario.yearsService, scenario.multiplier)
            : null),
        memberVaRating: scenario.memberVaRating,
        memberVaPay: scenario.memberVaPay,
        comparisons,
      };
    });

    const vaMatrix = VA_SCENARIO_RATINGS.map((rating) => {
      const row = approvedVa?.vaCompensationRates.find(
        (r) => r.rating === rating && r.dependentKey === "veteran_spouse_two_children",
      );
      return {
        rating,
        monthlyAmount: row?.monthlyAmount ?? null,
        sourceVersionId: approvedVa?.id ?? null,
        effectiveDate: approvedVa?.effectiveDate ?? null,
      };
    });

    return jsonOk({
      scenarios: enriched,
      vaMatrix,
      disclaimer:
        "Financial outputs are planning estimates. Verify rates against the latest administrator-approved official tables.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
