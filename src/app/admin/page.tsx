import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ApproveRateButton } from "@/components/admin/ApproveRateButton";
import { RateImportForm } from "@/components/admin/RateImportForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function AdminPage() {
  const { dashboard, ctx } = await getDashboardForPage();
  if (ctx.user.role !== "admin") redirect("/dashboard");

  const templates = await prisma.checklistTemplate.findMany({
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "desc" },
  });
  const versions = await prisma.benefitRateVersion.findMany({
    orderBy: { importedAt: "desc" },
    take: 10,
  });

  return (
    <AppShell
      title="Administrator tools"
      subtitle="Restricted template and official-rate maintenance"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="mb-4 rounded-xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
        This area is for application administrators maintaining checklist templates and approved rate tables. It is intentionally hidden from normal member navigation.
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Checklist templates">
          {templates.length === 0 ? (
            <EmptyState title="No templates found" description="Run the seed script first." />
          ) : (
            <ul className="space-y-3 text-sm">
              {templates.map((template) => (
                <li key={template.id} className="rounded-xl border border-border/70 px-3 py-2">
                  <div className="font-medium">{template.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                    v{template.version} · {template._count.tasks} tasks
                    <Badge variant={template.active ? "default" : "outline"}>{template.active ? "active" : "inactive"}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <RateImportForm />
      </div>

      <Panel title="Rate versions" className="mt-4">
        {versions.length === 0 ? (
          <EmptyState title="No rate versions imported yet" />
        ) : (
          <ul className="space-y-2 text-sm">
            {versions.map((version) => (
              <li key={version.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-medium">{version.benefitType}<Badge variant="outline">{version.status}</Badge></div>
                  <div className="text-muted-foreground">{version.sourceUrl}</div>
                </div>
                {version.status === "staged" ? <ApproveRateButton versionId={version.id} /> : <span className="text-emerald-700">Approved</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
