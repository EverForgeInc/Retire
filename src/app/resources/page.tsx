import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { getDashboardForPage } from "@/lib/server-data";
import { RESOURCE_LINKS } from "@/lib/resources";

const CATEGORY_LABELS = {
  transition: "Transition planning",
  benefits: "Benefits and claims",
  finance: "Pay and finance",
  health: "Health care",
} as const;

export default async function ResourcesPage() {
  const { dashboard } = await getDashboardForPage();

  return (
    <AppShell
      title="Help & Resources"
      subtitle="Official starting points for the decisions in your plan"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
          <Panel key={category} title={label}>
            <ul className="space-y-3">
              {RESOURCE_LINKS.filter((resource) => resource.category === category).map((resource) => (
                <li key={resource.href}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-3 rounded-lg border border-border/70 p-3 transition hover:border-blue-400 hover:bg-blue-50"
                  >
                    <span>
                      <span className="font-medium text-slate-900 group-hover:text-blue-700">{resource.label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{resource.description}</span>
                    </span>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Links open on external government websites. Confirm current requirements with your installation and the linked agency.
      </p>
    </AppShell>
  );
}
