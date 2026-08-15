import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function AuditPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const events = await prisma.auditEvent.findMany({
    where: { memberProfileId: ctx.profile!.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AppShell
      title="Audit history"
      subtitle="Tracked changes to profile, tasks, and evidence"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <Panel title="Recent events" contentClassName="px-0">
        {events.length === 0 ? (
          <div className="px-4">
            <EmptyState title="No audit events yet" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((event) => (
              <li key={event.id} className="px-5 py-4 text-sm">
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  {event.entityType}
                  <Badge variant="outline">{event.action}</Badge>
                </div>
                <div className="text-muted-foreground">{event.createdAt.toISOString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
