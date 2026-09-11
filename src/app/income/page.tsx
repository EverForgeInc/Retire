import { AppShell } from "@/components/layout/AppShell";
import { IncomeComparisonTable } from "@/components/income/IncomeComparisonTable";
import { IncomeScenarioEditor } from "@/components/income/IncomeScenarioEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KpiCard, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { compareLocationCash, estimateRetiredPay, VA_SCENARIO_RATINGS } from "@/lib/rules/income";
import { getDashboardForPage } from "@/lib/server-data";
import { formatCurrency } from "@/lib/utils";

const DISPLAYED_DEPENDENT_KEY = "veteran_spouse_two_children";
const DISPLAYED_DEPENDENT_LABEL = "Veteran + spouse + two children";

export default async function IncomePage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const scenarios = await prisma.incomeScenario.findMany({
    where: { memberProfileId: ctx.profile!.id },
    include: {
      locations: {
        include: { location: { include: { costVersions: { where: { approved: true } } } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  const approvedVa = await prisma.benefitRateVersion.findFirst({
    where: { benefitType: "va_compensation", status: "approved" },
    include: { vaCompensationRates: true },
    orderBy: { effectiveDate: "desc" },
  });
  const savedLocations = await prisma.savedLocation.findMany({
    where: { memberProfileId: ctx.profile!.id },
    select: { locationId: true, manualCosts: true },
  });
  const manualCostsByLocation = new Map(
    savedLocations.map((savedLocation) => [savedLocation.locationId, JSON.parse(savedLocation.manualCosts || "{}")]),
  );

  const scenario = scenarios[0];
  const vaMatrix = VA_SCENARIO_RATINGS.map((rating) => {
    const row = approvedVa?.vaCompensationRates.find(
      (r) => r.rating === rating && r.dependentKey === DISPLAYED_DEPENDENT_KEY,
    );
    return { rating, monthlyAmount: row?.monthlyAmount ?? null };
  });
  const selectedVaPay = vaMatrix.find((item) => item.rating === (scenario?.memberVaRating ?? 0))?.monthlyAmount ?? scenario?.memberVaPay ?? 0;

  const comparisons = (scenario?.locations || [])
    .map((sel) => {
      const expenses = {
        ...Object.fromEntries(sel.location.costVersions.filter((c) => c.amountUsd != null).map((c) => [c.category, c.amountUsd as number])),
        ...(manualCostsByLocation.get(sel.location.id) || {}),
        ...JSON.parse(sel.customExpenses || "{}"),
      };
      const result = Object.keys(expenses).length > 0 ? compareLocationCash(
          {
            estimatedRetiredPay: scenario.estimatedRetiredPay ?? 0,
            memberVaPay: selectedVaPay,
            spouseVaPay: scenario.spouseVaPay ?? 0,
            civilianIncome: scenario.civilianIncome ?? 0,
            otherIncome: scenario.otherIncome ?? 0,
          },
          expenses,
        ) : null;
      return {
        locationId: sel.location.id,
        label: `${sel.location.city}${sel.location.region ? `, ${sel.location.region}` : ""}, ${sel.location.country}`,
        totalMonthlyIncome: result?.totalMonthlyIncome ?? null,
        totalMonthlyExpenses: result?.totalMonthlyExpenses ?? null,
        remainingMonthlyCash: result?.remainingMonthlyCash ?? null,
        provenance: {
          confidence: result ? "medium" : "unavailable",
          userOverride:
            Object.keys(manualCostsByLocation.get(sel.location.id) || {}).length > 0 ||
            Object.keys(JSON.parse(sel.customExpenses || "{}")).length > 0,
          status: result ? ("available" as const) : ("unavailable" as const),
        },
      };
    })
    .sort((a, b) => (b.remainingMonthlyCash ?? -Infinity) - (a.remainingMonthlyCash ?? -Infinity));

  const estimated =
    scenario?.estimatedRetiredPay ??
    (scenario?.high3Monthly && scenario.yearsService && scenario.multiplier
      ? estimateRetiredPay(scenario.high3Monthly, scenario.yearsService, scenario.multiplier)
      : 0);

  return (
    <AppShell
      title="Income Planner"
      subtitle="See and edit the assumptions behind retired pay, VA pay, and remaining cash"
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
          Financial outputs are planning estimates. The VA amount shown here uses the same approved rate table as the matrix below for {DISPLAYED_DEPENDENT_LABEL}. Verify final retirement and benefit amounts against official sources.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Scenario" value={scenario?.name || "Primary retirement scenario"} hint={`VA ${scenario?.memberVaRating ?? 0}%`} />
        <KpiCard label="Estimated retired pay" value={formatCurrency(estimated || 0)} hint="High-3 × years × multiplier" />
        <KpiCard label="Member VA pay" value={formatCurrency(selectedVaPay || 0)} hint={DISPLAYED_DEPENDENT_LABEL} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <IncomeScenarioEditor
          rank={ctx.profile!.rank}
          initial={{
            name: scenario?.name || "Primary retirement scenario",
            retirementSystem: scenario?.retirementSystem || "High-3",
            high3Monthly: scenario?.high3Monthly ?? null,
            yearsService: scenario?.yearsService ?? null,
            multiplier: scenario?.multiplier ?? 0.025,
            memberVaRating: scenario?.memberVaRating ?? 0,
            civilianIncome: scenario?.civilianIncome ?? 0,
            otherIncome: scenario?.otherIncome ?? 0,
          }}
          vaMatrix={vaMatrix}
        />

        <Panel title="How retired pay is being estimated">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted-foreground">Rank / pay grade</dt><dd className="font-semibold">{ctx.profile!.rank || "Not set in profile"}</dd></div>
            <div><dt className="text-muted-foreground">Retirement system</dt><dd className="font-semibold">{scenario?.retirementSystem || "High-3"}</dd></div>
            <div><dt className="text-muted-foreground">High-3 monthly average used</dt><dd className="font-semibold">{scenario?.high3Monthly == null ? "Not entered" : formatCurrency(scenario.high3Monthly)}</dd></div>
            <div><dt className="text-muted-foreground">Years of service used</dt><dd className="font-semibold">{scenario?.yearsService ?? "Not entered"}</dd></div>
            <div><dt className="text-muted-foreground">Multiplier per year</dt><dd className="font-semibold">{scenario?.multiplier == null ? "Not entered" : `${(scenario.multiplier * 100).toFixed(2)}%`}</dd></div>
          </dl>
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3 text-sm">
            <strong>Formula:</strong> High-3 monthly average × years of service × retirement multiplier.
            <p className="mt-1 text-muted-foreground">The result is a planning estimate, not an official retired-pay statement.</p>
          </div>
        </Panel>
      </div>

      <Panel title={`VA rating matrix — ${DISPLAYED_DEPENDENT_LABEL}`} className="mt-4" description={approvedVa ? `Approved table effective ${approvedVa.effectiveDate.toISOString().slice(0, 10)}` : "No approved VA table is currently available."}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {vaMatrix.map((item) => (
            <div key={item.rating} className={`rounded-xl border px-3 py-2 text-sm ${item.rating === (scenario?.memberVaRating ?? 0) ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10" : "bg-muted/40"}`}>
              <div className="font-semibold">{item.rating}%</div>
              <div className="text-muted-foreground">{item.monthlyAmount == null ? "n/a" : formatCurrency(item.monthlyAmount)}</div>
            </div>
          ))}
        </div>
      </Panel>

      <IncomeComparisonTable rows={comparisons} />
    </AppShell>
  );
}
