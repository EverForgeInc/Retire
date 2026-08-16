import { AppShell } from "@/components/layout/AppShell";
import { TaskDetailForm } from "@/components/tasks/TaskDetailForm";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { serializeTask } from "@/lib/dashboard";
import { getDashboardForPage } from "@/lib/server-data";
import { toDateOnly } from "@/lib/rules/date-engine";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ taskId: string }> };

export default async function TaskDetailPage({ params }: Params) {
  const { taskId } = await params;
  const { ctx, dashboard } = await getDashboardForPage();
  const task = await prisma.memberTask.findFirst({
    where: { id: taskId, memberProfileId: ctx.profile!.id },
    include: { evidenceRefs: true, taskTemplate: true },
  });
  if (!task) notFound();

  return (
    <AppShell
      title="Task detail"
      subtitle={task.sectionName ?? "Checklist task"}
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Panel
          title={task.title}
          description={
            task.taskTemplate?.description ||
            "Track status, optional completion date, notes, and evidence references."
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="outline">{task.status}</Badge>
            {task.ownerLabel ? <Badge variant="secondary">{task.ownerLabel}</Badge> : null}
          </div>
          <TaskDetailForm task={serializeTask(task)} />
        </Panel>
        <div className="space-y-4">
          <Panel title="Read-only details">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Owner</dt>
                <dd>{task.ownerLabel || "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Evidence expected</dt>
                <dd>{task.taskTemplate?.evidenceLabel || "None specified"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Window</dt>
                <dd>
                  {task.calculatedStart ? toDateOnly(task.calculatedStart) : "-"} to{" "}
                  {task.calculatedEnd ? toDateOnly(task.calculatedEnd) : "ongoing"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Required level</dt>
                <dd>{task.requiredLevel}</dd>
              </div>
            </dl>
          </Panel>
          <Panel
            title="Evidence references"
            description="Medical files stay outside the app by default."
          >
            {task.evidenceRefs.length === 0 ? (
              <EmptyState title="No evidence references yet" />
            ) : (
              <ul className="space-y-2 text-sm">
                {task.evidenceRefs.map((ref) => (
                  <li key={ref.id} className="rounded-lg bg-muted/50 px-3 py-2">
                    <div className="font-medium">{ref.evidenceType}</div>
                    <div className="text-muted-foreground">
                      {ref.externalStorageLabel || ref.confirmationNumber || ref.summary}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
