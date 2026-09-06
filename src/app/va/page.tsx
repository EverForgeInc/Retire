import { AppShell } from "@/components/layout/AppShell";
import { VaConditionFormGuided } from "@/components/va/VaConditionFormGuided";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function VaPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const conditions = await prisma.vaCondition.findMany({
    where: { memberProfileId: ctx.profile!.id },
    include: { limitations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell
      title="VA Claims"
      subtitle="Track conditions and functional impact in your own words"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <Alert className="mb-4">
        <AlertTitle>Accuracy notice</AlertTitle>
        <AlertDescription>
          This tracker organizes your own observations and evidence. It does not diagnose conditions,
          coach exaggeration, or predict a VA rating.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Tracked conditions">
          {conditions.length === 0 ? (
            <EmptyState title="No conditions tracked yet" description="Add your first condition on the right." />
          ) : (
            <ul className="space-y-4">
              {conditions.map((condition) => (
                <li key={condition.id} className="rounded-xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{condition.conditionName}</p>
                    {condition.claimStatus ? <Badge variant="outline">{condition.claimStatus}</Badge> : null}
                    {condition.examStatus ? <Badge variant="secondary">{condition.examStatus}</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {condition.bodySystem || "Unspecified system"}
                  </p>
                  {condition.memberPrimaryTheory ? (
                    <p className="mt-2 text-sm text-slate-700">
                      Member theory: {condition.memberPrimaryTheory}
                      {condition.memberAlternateTheory ? `; alternate: ${condition.memberAlternateTheory}` : ""}
                    </p>
                  ) : null}
                  {condition.representativePrimaryTheory || condition.vaFinalPrimaryDetermination ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reviewed theory: {condition.representativePrimaryTheory || "Not reviewed"}; VA determination: {condition.vaFinalPrimaryDetermination || "Not determined"}
                    </p>
                  ) : null}
                  {condition.functionalImpactNarrative ? (
                    <p className="mt-3 text-sm text-slate-700">{condition.functionalImpactNarrative}</p>
                  ) : null}
                  {condition.limitations.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {condition.limitations.map((limit) => (
                        <li key={limit.id}>
                          <strong>{limit.activity}:</strong> {limit.limitationDescription}
                          {limit.thresholdValue != null
                            ? ` (${limit.thresholdValue} ${limit.thresholdUnit || ""})`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <VaConditionFormGuided conditions={conditions.map(({ id, conditionName }) => ({ id, conditionName }))} />
      </div>
    </AppShell>
  );
}
