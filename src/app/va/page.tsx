import { AppShell } from "@/components/layout/AppShell";
import { VaConditionFormGuided } from "@/components/va/VaConditionFormGuided";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

function missingCoreFields(condition: {
  bodyRegion: string | null;
  laterality: string | null;
  diagnosisStatus: string | null;
  symptoms: string | null;
  functionalImpactNarrative: string | null;
  memberPrimaryTheory: string | null;
  limitations: { id: string }[];
}) {
  return [
    !condition.bodyRegion ? "body region" : null,
    !condition.laterality ? "laterality" : null,
    !condition.diagnosisStatus ? "diagnosis status" : null,
    !condition.symptoms ? "current symptoms" : null,
    !condition.functionalImpactNarrative ? "functional impact" : null,
    !condition.memberPrimaryTheory ? "claim relationship" : null,
    condition.limitations.length === 0 ? "measurable limitation" : null,
  ].filter((value): value is string => Boolean(value));
}

export default async function VaPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const conditions = await prisma.vaCondition.findMany({
    where: { memberProfileId: ctx.profile!.id },
    include: { limitations: true },
    orderBy: { createdAt: "desc" },
  });

  const audit = conditions.map((condition) => ({ condition, missing: missingCoreFields(condition) }));
  const needsReviewCount = audit.filter(({ missing }) => missing.length > 0).length;

  return (
    <AppShell
      title="VA Claims"
      subtitle="Build your own condition inventory step by step before representative or VA review"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <Panel title="How to use this tracker" description="Work one condition at a time. You do not need to know VA terminology before you start." className="mb-4">
        <ol className="grid gap-3 text-sm md:grid-cols-3">
          <li className="rounded-xl border border-border/70 p-3"><strong>1. Identify the condition.</strong><p className="mt-1 text-muted-foreground">Choose the body area, name the condition or symptom, and record which side is affected.</p></li>
          <li className="rounded-xl border border-border/70 p-3"><strong>2. Describe what you actually experience.</strong><p className="mt-1 text-muted-foreground">Record current symptoms and how they affect work, daily activities, movement, sleep, or other real-life functions.</p></li>
          <li className="rounded-xl border border-border/70 p-3"><strong>3. Add evidence and review gaps.</strong><p className="mt-1 text-muted-foreground">Track evidence references and use the coverage audit to see what is still missing before VSO or representative review.</p></li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">The app preserves your original member report. A later representative review or VA determination should remain separate so your own account is not silently rewritten.</p>
      </Panel>

      <Alert className="mb-4">
        <AlertTitle>Accuracy and privacy notice</AlertTitle>
        <AlertDescription>
          This tracker organizes your own observations and evidence. It does not diagnose conditions, coach exaggeration, or predict a VA rating. Do not enter SSNs or unnecessary medical-record identifiers.
        </AlertDescription>
      </Alert>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Master inventory</p><p className="mt-1 text-2xl font-semibold">{conditions.length}</p><p className="text-sm text-muted-foreground">conditions or issues retained</p></div>
        <div className="rounded-xl border p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coverage audit</p><p className="mt-1 text-2xl font-semibold">{needsReviewCount}</p><p className="text-sm text-muted-foreground">need one or more core fields</p></div>
        <div className="rounded-xl border p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workflow</p><p className="mt-1 text-sm font-semibold">Your report → Evidence → Review</p><p className="text-sm text-muted-foreground">Keep each stage distinct</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Tracked conditions" description="Items remain visible so gaps can be completed before claim submission or representative review.">
          {conditions.length === 0 ? (
            <EmptyState title="No conditions tracked yet" description="Use the guided form on the right to add your first condition." />
          ) : (
            <ul className="space-y-4">
              {audit.map(({ condition, missing }) => (
                <li key={condition.id} className="rounded-xl border border-border/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{condition.conditionName}</p>
                    {condition.claimStatus ? <Badge variant="outline">{condition.claimStatus.replace(/_/g, " ")}</Badge> : null}
                    {condition.examStatus ? <Badge variant="secondary">{condition.examStatus.replace(/_/g, " ")}</Badge> : null}
                    {missing.length === 0 ? <Badge>Core fields captured</Badge> : <Badge variant="outline">Needs review</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{condition.bodySystem || "Unspecified system"}{condition.bodyRegion ? ` · ${condition.bodyRegion}` : ""}{condition.laterality ? ` · ${condition.laterality}` : ""}</p>
                  {condition.memberPrimaryTheory ? <p className="mt-2 text-sm"><strong>Your reported relationship:</strong> {condition.memberPrimaryTheory.replace(/_/g, " ")}{condition.memberAlternateTheory ? `; alternate: ${condition.memberAlternateTheory.replace(/_/g, " ")}` : ""}</p> : null}
                  {condition.representativePrimaryTheory || condition.vaFinalPrimaryDetermination ? <p className="mt-1 text-xs text-muted-foreground">Reviewed relationship: {condition.representativePrimaryTheory?.replace(/_/g, " ") || "Not reviewed"}; VA determination: {condition.vaFinalPrimaryDetermination?.replace(/_/g, " ") || "Not determined"}</p> : null}
                  {condition.symptoms ? <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your reported symptoms</p><p className="mt-1 whitespace-pre-line">{condition.symptoms}</p></div> : null}
                  {condition.functionalImpactNarrative ? <div className="mt-3 rounded-lg bg-emerald-50/60 p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Actual functional impact</p><p className="mt-1 whitespace-pre-line">{condition.functionalImpactNarrative}</p></div> : null}
                  {condition.limitations.length > 0 ? <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{condition.limitations.map((limit) => <li key={limit.id}><strong>{limit.activity}:</strong> {limit.limitationDescription}{limit.thresholdValue != null ? ` (${limit.thresholdValue} ${limit.thresholdUnit || ""})` : ""}</li>)}</ul> : null}
                  {missing.length > 0 ? <p className="mt-3 text-xs text-muted-foreground"><strong>Still needs:</strong> {missing.join(", ")}.</p> : null}
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
