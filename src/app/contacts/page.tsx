import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { getDashboardForPage } from "@/lib/server-data";

const CONTACTS = [
  { office: "Military personnel / retirements", note: "Use your service personnel portal or local MPF/MPS to verify retirement processing and final appointments.", href: "https://myfss.us.af.mil/", link: "Open myFSS" },
  { office: "Installation support", note: "Military OneSource can help locate transition, relocation, financial, and family support resources.", href: "https://www.militaryonesource.mil/", link: "Open Military OneSource" },
  { office: "VA benefits", note: "Use VA.gov for claims, benefits, health care, and official status information.", href: "https://www.va.gov/", link: "Open VA.gov" },
  { office: "VSO / accredited representative", note: "Find an accredited VSO, attorney, or claims agent for claim assistance.", href: "https://www.va.gov/get-help-from-accredited-representative/", link: "Find an accredited representative" },
  { office: "Transition Assistance Program", note: "Use official DoD TAP resources for current transition guidance and materials.", href: "https://www.dodtap.mil/", link: "Open DoD TAP" },
];

export default async function ContactsPage() {
  const { dashboard } = await getDashboardForPage();

  return (
    <AppShell
      title="Contacts & Resources"
      subtitle="Official starting points plus space to track the local offices you actually work with"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="mb-4 rounded-xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
        Local phone numbers and offices vary by installation. These links give you an official place to start rather than leaving you to search from scratch. Verify local contact information before relying on it.
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {CONTACTS.map((contact) => (
          <Panel key={contact.office} title={contact.office}>
            <p className="text-sm text-muted-foreground">{contact.note}</p>
            <a className="mt-3 inline-block text-sm font-semibold text-[color:var(--gold)] hover:underline" href={contact.href} target="_blank" rel="noreferrer">{contact.link}</a>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
