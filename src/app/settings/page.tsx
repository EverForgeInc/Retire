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
      subtitle="Profile, privacy, summaries, and exports"
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
            <div><dt className="text-muted-foreground">Name</dt><dd>{dashboard.profile.fullName}</dd></div>
            <div><dt className="text-muted-foreground">Rank / pay grade</dt><dd>{dashboard.profile.rank}</dd></div>
            <div><dt className="text-muted-foreground">Email</dt><dd>{ctx.user.email}</dd></div>
            <div><dt className="text-muted-foreground">Retirement date</dt><dd>{dashboard.profile.projectedRetirementDate}</dd></div>
          </dl>
          <Link href="/onboarding" className={cn(buttonVariants({ variant: "link" }), "mt-4 h-auto px-0")}>
            Update profile and recalculate dates
          </Link>
        </Panel>

        <Panel title="Privacy">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>No SSN or Last 4 is collected.</li>
            <li>No completion initials are required.</li>
            <li>Sensitive medical files remain outside the app by default.</li>
            <li>Scheduled summaries exclude diagnoses and VA narratives.</li>
          </ul>
        </Panel>

        <Panel title="Exports" description="Use these when you want a copy of your planner data outside the app.">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">JSON backup</p>
              <p className="text-muted-foreground">Structured data for backup, troubleshooting, or future import tools.</p>
              <a href="/api/exports/json" className={cn(buttonVariants({ variant: "outline" }), "mt-2")} target="_blank" rel="noreferrer">Open JSON export</a>
            </div>
            <div>
              <p className="font-semibold">CSV checklist</p>
              <p className="text-muted-foreground">Spreadsheet-friendly checklist data for Excel, Numbers, or Google Sheets.</p>
              <a href="/api/exports/csv" className={cn(buttonVariants({ variant: "outline" }), "mt-2")} target="_blank" rel="noreferrer">Download CSV</a>
            </div>
            <div>
              <p className="font-semibold">Printable checklist</p>
              <p className="text-muted-foreground">A print-oriented version for appointments, transition counseling, or personal review.</p>
              <form action="/api/exports/pdf" method="post" className="mt-2">
                <button type="submit" className={buttonVariants({ variant: "outline" })}>Create printable checklist</button>
              </form>
            </div>
          </div>
        </Panel>

        <Panel title="More">
          <ul className="space-y-3 text-sm">
            <li><Link href="/reminders" className="font-semibold text-[color:var(--gold)] hover:underline">Scheduled summary settings</Link><p className="text-muted-foreground">Choose daily/weekly transition reminders.</p></li>
            <li><Link href="/audit" className="font-semibold text-[color:var(--gold)] hover:underline">Audit history</Link><p className="text-muted-foreground">Review recorded task and planner changes.</p></li>
            <li><Link href="/help" className="font-semibold text-[color:var(--gold)] hover:underline">Help & Resources</Link><p className="text-muted-foreground">Guidance, glossary-style explanations, and official starting points.</p></li>
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
