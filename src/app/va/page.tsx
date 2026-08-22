import { AppShell } from "@/components/layout/AppShell";
import { VaConditionFormV2 } from "@/components/va/VaConditionFormV2";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

function planningLine(text: string | null | undefined, prefix: string) {
  if (!text) return null;
  return text
    .split("\n")
    .find((line) => line.toLowerCase().startsWith(prefix.toLowerCase()))
    ?.slice(prefix.length)
    .trim();
}

export default async function VaPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const conditions = await prisma.vaCondition.findMany({
    where: { memberProfileId: ctx.profile!.id },
    include: { limitations: true },
    orderBy: { createdAt: "desc" },
  });

  const audit = conditions.map((condition) => {
    const evidenceStatus = planningLine(condition.treatmentHistory, "Evidence status:");
    const ratingScreen = planningLine(condition.treatmentHistory, "Preliminary rating screen:");
    const relationship = planningLine(condition.onsetOrServiceEvent, "Primary relationship:");
    const exactLocation = planningLine(condition.flareUps, "Exact body location:");
    const missing = [
      !exactLocation ? "exact location" : null,
      !condition.symptoms ? "current symptoms" : null,
      !condition.functionalImpactNarrative ? "actual functional impact" : null,
      !relationship ? "claim relationship" : null,
      !evidenceStatus ? "evidence status" : null,
    ].filter(Boolean) as string[];

    return { condition, evidenceStatus, ratingScreen, relationship, exactLocation, missing };
  });

  const needsReviewCount = audit.filter((item) => item.missing.length > 0).length;

  return (
    <AppShell
      title="VA Claims"
      subtitle="Build a master condition inventory, preserve the member's own report, and match it to evidence later"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <Alert className="mb-4">
        <AlertTitle>Accuracy and privacy notice</AlertTitle>
        <AlertDescription>
          This tracker organizes the member&apos;s own observations, planning theories, and evidence references. It does not
          diagnose a condition, establish service connection, or predict a VA award. Suggested impact examples must be
          edited to the member&apos;s actual experience. Do not enter SSNs or unnecessary medical-record identifiers.
        </AlertDescription>
      </Alert>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Master inventory</p>
          <p className="mt-1 text-2xl font-semibold">{conditions.length}</p>
          <p className="text-sm text-muted-foreground">conditions / issues retained</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coverage audit</p>
          <p className="mt-1 text-2xl font-semibold">{needsReviewCount}</p>
          <p className="text-sm text-muted-foreground">need one or more core fields</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workflow</p>
          <p className="mt-1 text-sm font-semibold">Report → Evidence → Review</p>
          <p className="text-sm text-muted-foreground">Do not overwrite the original member report</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          <Panel title="Master condition inventory" description="Each issue stays visible until records support consolidation, reclassification, or removal.">
            {conditions.length === 0 ? (
              <EmptyState title="No conditions tracked yet" description="Add the first issue using the structured intake." />
            ) : (
              <ul className="space-y-4">
                {audit.map(({ condition, evidenceStatus, ratingScreen, relationship, exactLocation, missing }) => (
                  <li key={condition.id} className="rounded-xl border border-border/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{condition.conditionName}</p>
                      {condition.diagnosisStatus ? <Badge variant="secondary">{condition.diagnosisStatus}</Badge> : null}
                      {evidenceStatus ? <Badge variant="outline">{evidenceStatus}</Badge> : null}
                      {missing.length > 0 ? <Badge variant="outline">Needs review</Badge> : <Badge>Core fields captured</Badge>}
                    </div>

                    <div className="mt-2 grid gap-1 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Body area:</strong> {condition.bodySystem || "Unspecified"}</p>
                      {exactLocation ? <p><strong className="text-foreground">Exact location:</strong> {exactLocation}</p> : null}
                      {relationship ? <p><strong className="text-foreground">Relationship theory:</strong> {relationship}</p> : null}
                    </div>

                    {condition.symptoms ? (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Member-reported symptoms</p>
                        <p className="mt-1 whitespace-pre-line">{condition.symptoms}</p>
                      </div>
                    ) : null}

                    {condition.functionalImpactNarrative ? (
                      <div className="mt-3 rounded-lg bg-emerald-50/60 p-3 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Actual functional impact</p>
                        <p className="mt-1 whitespace-pre-line">{condition.functionalImpactNarrative}</p>
                      </div>
                    ) : null}

                    {condition.treatmentHistory ? (
                      <details className="mt-3 rounded-lg border p-3 text-sm">
                        <summary className="cursor-pointer font-medium">Planning / evidence details</summary>
                        <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{condition.treatmentHistory}</pre>
                      </details>
                    ) : null}

                    {ratingScreen ? (
                      <p className="mt-3 text-xs text-amber-800">
                        <strong>Preliminary rating screen:</strong> {ratingScreen} — planning only, not a predicted award.
                      </p>
                    ) : null}

                    {condition.limitations.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {condition.limitations.map((limit) => (
                          <li key={limit.id}>
                            <strong className="text-foreground">{limit.activity}:</strong> {limit.limitationDescription}
                            {limit.thresholdValue != null ? ` (${limit.thresholdValue} ${limit.thresholdUnit || ""})` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {missing.length > 0 ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        <strong>Coverage audit still needs:</strong> {missing.join(", ")}.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <VaConditionFormV2 />
      </div>
    </AppShell>
  );
}
