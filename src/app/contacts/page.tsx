import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";
import { getDashboardForPage } from "@/lib/server-data";

const CONTACTS = [
  { office: "MPS / Retirements", note: "Confirm final appointments with your local office." },
  { office: "Finance", note: "Verify final pay, leave payout, and allotments." },
  { office: "TMO", note: "Coordinate household goods and travel entitlements." },
  { office: "VA / BDD", note: "Track claim windows without storing medical files here." },
  { office: "SkillBridge coordinator", note: "Confirm internship dates and reporting instructions." },
];

export default async function ContactsPage() {
  const { dashboard } = await getDashboardForPage();

  return (
    <AppShell
      title="Contacts"
      subtitle="Local office reminders. Verify current numbers through official channels."
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {CONTACTS.map((contact) => (
          <Panel key={contact.office} title={contact.office}>
            <p className="text-sm text-muted-foreground">{contact.note}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
