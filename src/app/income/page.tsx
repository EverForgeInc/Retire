import { AppShell } from "@/components/layout/AppShell";
import { IncomeComparisonTable } from "@/components/income/IncomeComparisonTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KpiCard, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { compareLocationCash, estimateRetiredPay, VA_SCENARIO_RATINGS } from "@/lib/rules/income";
import { getDashboardForPage } from "@/lib/server-data";
import { formatCurrency } from "@/lib/utils";

export default async function IncomePage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const scenarios = await prisma.incomeScenario.findMany({
    where: { memberProfileId: ctx.profile!.id },
    include: {
      locations: {
        include: { location: { include: { costVersions: { where: { approved: true } } } } },
      },
    },
  });
  const approvedVa = await prisma.benefitRateVersion.findFirst({
    where: { benefitType: "va_compensation", status: "approved" },
    include: { vaCompensationRates: true },
    orderBy: { effectiveDate: "desc" },
  });

  const scenario = scenarios[0];
  const comparisons = (scenario?.locations || [])
    .map((sel) => {
      const expenses = {
        ...Object.fromEntries(sel.location.costVersions.map((c) => [c.category, c.amountUsd ?? 0])),
        ...JSON.parse(sel.customExpenses || "{}"),
      };
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
        ...result,
        provenance: {
          confidence: "medium",
          userOverride: Object.keys(JSON.parse(sel.customExpenses || "{}")).length > 0,
        },
      };
    })
    .sort((a, b) => b.remainingMonthlyCash - a.remainingMonthlyCash);

  const estimated =
    scenario?.estimatedRetiredPay ??
    (scenario?.high3Monthly && scenario.yearsService && scenario.multiplier
      ? estimateRetiredPay(scenario.high3Monthly, scenario.yearsService, scenario.multiplier)
      : 0);

  return (
    <AppShell
      title="Income Planner"
      subtitle="Retirement pay, VA tiers, and remaining cash"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <Alert className="mb-4">
        <AlertDescription>
          Financial outputs are planning estimates. Verify rates against the latest administrator-approved
          official tables.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Scenario" value={scenario?.name || "None"} hint={`VA ${scenario?.memberVaRating ?? 0}%`} />
        <KpiCard label="Estimated retired pay" value={formatCurrency(estimated || 0)} />
        <KpiCard label="Member VA pay" value={formatCurrency(scenario?.memberVaPay || 0)} />
      </div>

      <Panel title="VA rating matrix (approved table)" className="mt-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {VA_SCENARIO_RATINGS.map((rating) => {
            const row = approvedVa?.vaCompensationRates.find(
              (r) => r.rating === rating && r.dependentKey === "veteran_spouse_two_children",
            );
            return (
              <div key={rating} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
                <div className="font-semibold">{rating}%</div>
                <div className="text-muted-foreground">
                  {row?.monthlyAmount == null ? "n/a" : formatCurrency(row.monthlyAmount)}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <IncomeComparisonTable rows={comparisons} />
    </AppShell>
  );
}
