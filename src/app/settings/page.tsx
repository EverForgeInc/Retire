import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/Panel";
import { getDashboardForPage } from "@/lib/server-data";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const { dashboard, ctx } = await getDashboardForPage();

  return (
    <AppShell
      title="Settings"
      subtitle="Profile, privacy, exports, and admin tools"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Profile">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd>{dashboard.profile.fullName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rank</dt>
              <dd>{dashboard.profile.rank}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{ctx.user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Retirement date</dt>
              <dd>{dashboard.profile.projectedRetirementDate}</dd>
            </div>
          </dl>
          <Link href="/onboarding" className={cn(buttonVariants({ variant: "link" }), "mt-4 h-auto px-0")}>
            Update profile and recalculate dates
          </Link>
        </Panel>

        <Panel title="Privacy">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>No SSN or Last 4 is collected.</li>
            <li>No completion initials are required.</li>
            <li>Medical files remain outside the app by default.</li>
            <li>Digest emails exclude diagnoses and VA narratives.</li>
          </ul>
        </Panel>

        <Panel title="Exports">
          <div className="flex flex-wrap gap-2">
            <a href="/api/exports/json" className={buttonVariants({ variant: "outline" })} download>
              Export JSON
            </a>
            <a href="/api/exports/csv" className={buttonVariants({ variant: "secondary" })} download>
              Export CSV
            </a>
            <a href="/api/exports/account" className={buttonVariants({ variant: "outline" })} download>
              Export account data
            </a>
            <form action="/api/exports/pdf" method="post">
              <button type="submit" className={buttonVariants({ variant: "outline" })}>
                Printable checklist
              </button>
            </form>
          </div>
        </Panel>

        <Panel title="More">
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/reminders" className="font-semibold text-blue-600 hover:underline">
                Digest email settings
              </Link>
            </li>
            <li>
              <Link href="/admin" className="font-semibold text-blue-600 hover:underline">
                Admin template & rate tools
              </Link>
            </li>
            <li>
              <Link href="/audit" className="font-semibold text-blue-600 hover:underline">
                Audit history
              </Link>
            </li>
            <li>
              <Link href="/timeline" className="font-semibold text-blue-600 hover:underline">
                Timeline calendar
              </Link>
            </li>
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
