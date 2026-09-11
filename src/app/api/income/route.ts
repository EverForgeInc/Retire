import { handleRouteError, jsonOk, PublicApiError, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { compareLocationCash, estimateRetiredPay, VA_SCENARIO_RATINGS } from "@/lib/rules/income";

const DISPLAYED_DEPENDENT_KEY = "veteran_spouse_two_children";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const scenarios = await prisma.incomeScenario.findMany({
      where: { memberProfileId: profile.id },
      include: {
        locations: {
          include: {
            location: {
              include: { costVersions: { where: { approved: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const savedLocations = await prisma.savedLocation.findMany({ where: { memberProfileId: profile.id } });
    const savedByLocationId = new Map(savedLocations.filter((item) => item.locationId).map((item) => [item.locationId, item]));

    const approvedVa = await prisma.benefitRateVersion.findFirst({
      where: { benefitType: "va_compensation", status: "approved" },
      include: { vaCompensationRates: true },
      orderBy: { effectiveDate: "desc" },
    });

    const enriched = scenarios.map((scenario) => {
      const comparisons = scenario.locations.map((sel) => {
        const expensesFromCustom = JSON.parse(sel.customExpenses || "{}") as Record<string, number>;
        const expensesFromApproved = Object.fromEntries(
          sel.location.costVersions.filter((c) => c.amountUsd != null).map((c) => [c.category, c.amountUsd as number]),
        );
        const savedLocation = savedByLocationId.get(sel.location.id);
        const manualCosts = savedLocation ? JSON.parse(savedLocation.manualCosts || "{}") as Record<string, number> : {};
        const expenses = { ...expensesFromApproved, ...manualCosts, ...expensesFromCustom };
        const hasUsableCostData = Object.keys(expenses).length > 0;
        const result = hasUsableCostData
          ? compareLocationCash(
              {
                estimatedRetiredPay: scenario.estimatedRetiredPay ?? 0,
                memberVaPay: scenario.memberVaPay ?? 0,
                spouseVaPay: scenario.spouseVaPay ?? 0,
                civilianIncome: scenario.civilianIncome ?? 0,
                otherIncome: scenario.otherIncome ?? 0,
              },
              expenses,
            )
          : null;
        return {
          locationId: sel.location.id,
          label: `${sel.location.city}${sel.location.region ? `, ${sel.location.region}` : ""}, ${sel.location.country}`,
          currency: sel.location.currency,
          expenses,
          totalMonthlyIncome: result?.totalMonthlyIncome ?? null,
          totalMonthlyExpenses: result?.totalMonthlyExpenses ?? null,
          remainingMonthlyCash: result?.remainingMonthlyCash ?? null,
          remainingAnnualCash: result?.remainingAnnualCash ?? null,
          expenseToIncomeRatio: result?.expenseToIncomeRatio ?? null,
          housingToIncomeRatio: result?.housingToIncomeRatio ?? null,
          provenance: {
            sources: sel.location.costVersions.map((cost) => ({
              category: cost.category,
              sourceType: cost.sourceType,
              sourceUrl: cost.sourceUrl,
              sourceDate: cost.sourceDate,
              lastUpdated: cost.lastUpdated ?? cost.lastVerified,
              confidence: cost.confidence,
              manualOverride: cost.isManualOverride,
            })),
            userOverride: Object.keys(manualCosts).length > 0 || Object.keys(expensesFromCustom).length > 0,
            status: hasUsableCostData ? "available" : "unavailable",
          },
        };
      });

      comparisons.sort((a, b) => (b.remainingMonthlyCash ?? -Infinity) - (a.remainingMonthlyCash ?? -Infinity));

      return {
        id: scenario.id,
        name: scenario.name,
        retirementSystem: scenario.retirementSystem,
        high3Monthly: scenario.high3Monthly,
        yearsService: scenario.yearsService,
        multiplier: scenario.multiplier,
        estimatedRetiredPay:
          scenario.estimatedRetiredPay ??
          (scenario.high3Monthly && scenario.yearsService && scenario.multiplier
            ? estimateRetiredPay(scenario.high3Monthly, scenario.yearsService, scenario.multiplier)
            : null),
        memberVaRating: scenario.memberVaRating,
        memberVaPay: scenario.memberVaPay,
        civilianIncome: scenario.civilianIncome,
        otherIncome: scenario.otherIncome,
        comparisons,
      };
    });

    const vaMatrix = VA_SCENARIO_RATINGS.map((rating) => {
      const row = approvedVa?.vaCompensationRates.find(
        (r) => r.rating === rating && r.dependentKey === DISPLAYED_DEPENDENT_KEY,
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
      displayedDependentKey: DISPLAYED_DEPENDENT_KEY,
      disclaimer: "Financial outputs are planning estimates. Verify rates against the latest approved official tables.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { profile } = await requireMemberContext();
    const body = await request.json();
    const name = String(body.name || "Primary retirement scenario").trim();
    const retirementSystem = String(body.retirementSystem || "High-3");
    const high3Monthly = Number(body.high3Monthly || 0);
    const yearsService = Number(body.yearsService || 0);
    const multiplier = Number(body.multiplier || 0);
    const memberVaRating = Number(body.memberVaRating ?? 0);
    const civilianIncome = Number(body.civilianIncome || 0);
    const otherIncome = Number(body.otherIncome || 0);

    if (!name || ![high3Monthly, yearsService, multiplier, civilianIncome, otherIncome].every(Number.isFinite)) {
      throw new PublicApiError("Enter valid numeric income assumptions.", 400);
    }
    if (!VA_SCENARIO_RATINGS.includes(memberVaRating as (typeof VA_SCENARIO_RATINGS)[number])) {
      throw new PublicApiError("Select a supported VA planning rating.", 400);
    }

    const approvedVa = await prisma.benefitRateVersion.findFirst({
      where: { benefitType: "va_compensation", status: "approved" },
      include: { vaCompensationRates: true },
      orderBy: { effectiveDate: "desc" },
    });
    const vaRow = approvedVa?.vaCompensationRates.find(
      (row) => row.rating === memberVaRating && row.dependentKey === DISPLAYED_DEPENDENT_KEY,
    );
    const memberVaPay = vaRow?.monthlyAmount ?? 0;
    const estimatedRetiredPay = high3Monthly > 0 && yearsService > 0 && multiplier > 0
      ? estimateRetiredPay(high3Monthly, yearsService, multiplier)
      : 0;

    const existing = await prisma.incomeScenario.findFirst({
      where: { memberProfileId: profile.id },
      orderBy: { createdAt: "asc" },
    });

    const data = {
      name,
      retirementSystem,
      high3Monthly,
      yearsService,
      multiplier,
      estimatedRetiredPay,
      memberVaRating,
      memberVaPay,
      civilianIncome,
      otherIncome,
      dependentConfiguration: JSON.stringify({ dependentKey: DISPLAYED_DEPENDENT_KEY }),
    };

    const scenario = existing
      ? await prisma.incomeScenario.update({ where: { id: existing.id }, data })
      : await prisma.incomeScenario.create({ data: { memberProfileId: profile.id, ...data } });

    return jsonOk({ scenario, vaSourceEffectiveDate: approvedVa?.effectiveDate ?? null });
  } catch (error) {
    return handleRouteError(error);
  }
}
