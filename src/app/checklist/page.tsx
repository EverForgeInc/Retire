import { AppShell } from "@/components/layout/AppShell";
import { ChecklistWorkbench } from "@/components/checklist/ChecklistWorkbench";
import { prisma } from "@/lib/db";
import { serializeTask } from "@/lib/dashboard";
import { getDashboardForPage } from "@/lib/server-data";

export default async function ChecklistPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; sectionId?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { ctx, dashboard } = await getDashboardForPage();
  const view = params.view === "all" ? "all" : "phase";
  const sectionId = params.sectionId || dashboard.currentPhase.sectionId;

  const tasks = await prisma.memberTask.findMany({
    where: { memberProfileId: ctx.profile!.id },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AppShell
      title="Checklist"
      subtitle="93-task chronological retirement checklist"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <ChecklistWorkbench
        tasks={tasks.map(serializeTask)}
        sections={dashboard.sections.map((section) => ({
          sectionId: section.sectionId,
          phase: section.phase,
          complete: section.complete,
          total: section.total,
        }))}
        initialView={view}
        initialSectionId={sectionId}
        initialStatus={params.status}
        currentPhaseId={dashboard.currentPhase.sectionId}
      />
    </AppShell>
  );
}
