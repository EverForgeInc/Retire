import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/Panel";
import { getDashboardForPage } from "@/lib/server-data";
import { cn } from "@/lib/utils";

const RESOURCES = [
  { label: "VA.gov", href: "https://www.va.gov/", note: "Benefits, claims, health care, and official VA guidance." },
  { label: "VA accredited representative search", href: "https://www.va.gov/get-help-from-accredited-representative/", note: "Find an accredited VSO, attorney, or claims agent." },
  { label: "Military OneSource", href: "https://www.militaryonesource.mil/", note: "Transition, relocation, financial, and family support." },
  { label: "DoD TAP", href: "https://www.dodtap.mil/", note: "Official Transition Assistance Program resources." },
  { label: "myFSS / service personnel resources", href: "https://myfss.us.af.mil/", note: "Use your service portal for current personnel and retirement guidance." },
];

export default async function HelpPage() {
  const { dashboard } = await getDashboardForPage();
  return (
    <AppShell
      title="Help & Resources"
      subtitle="What each area does, what to enter, and where to verify official information"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Getting started" description="A simple path through the planner.">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Confirm your profile and retirement date.</li>
            <li>Work the Checklist and update task status as you go.</li>
            <li>Use Timeline & Leave Plan to see SkillBridge, PTDY, terminal leave, final-out, and retirement dates together.</li>
            <li>Build your VA condition inventory before representative review.</li>
            <li>Enter income assumptions and compare retirement locations.</li>
            <li>Use Document Tracker for references and request confirmations, not sensitive medical-file storage.</li>
          </ol>
        </Panel>

        <Panel title="What the main areas are for">
          <dl className="space-y-3 text-sm">
            <div><dt className="font-semibold">Checklist</dt><dd className="text-muted-foreground">Your chronological transition action list.</dd></div>
            <div><dt className="font-semibold">VA Claims</dt><dd className="text-muted-foreground">Organize your own condition report, symptoms, functional impact, evidence references, and review gaps.</dd></div>
            <div><dt className="font-semibold">Income Planner</dt><dd className="text-muted-foreground">Estimate retirement income and remaining monthly cash using transparent assumptions.</dd></div>
            <div><dt className="font-semibold">Location Comparison</dt><dd className="text-muted-foreground">Compare saved locations using available cost data. Missing data stays unknown rather than becoming zero.</dd></div>
            <div><dt className="font-semibold">Scheduled Summaries</dt><dd className="text-muted-foreground">Choose a daily or weekly summary of due tasks, overdue items, follow-ups, and milestones.</dd></div>
          </dl>
        </Panel>

        <Panel title="Official resources" description="The planner helps organize your work; these links are starting points for authoritative guidance.">
          <div className="space-y-3">
            {RESOURCES.map((resource) => (
              <div key={resource.href} className="rounded-xl border border-border/70 p-3">
                <a href={resource.href} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--gold)] hover:underline">{resource.label}</a>
                <p className="mt-1 text-sm text-muted-foreground">{resource.note}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Need to change your information?">
          <div className="flex flex-wrap gap-2">
            <Link href="/onboarding" className={cn(buttonVariants(), "no-underline")}>Update profile</Link>
            <Link href="/settings" className={buttonVariants({ variant: "outline" })}>Open settings</Link>
            <Link href="/contacts" className={buttonVariants({ variant: "outline" })}>Contacts & Resources</Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
