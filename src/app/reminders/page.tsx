import { AppShell } from "@/components/layout/AppShell";
import { DigestSettingsForm } from "@/components/settings/DigestSettingsForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Panel } from "@/components/ui/Panel";
import { prisma } from "@/lib/db";
import { getDashboardForPage } from "@/lib/server-data";

export default async function RemindersPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  const prefs = await prisma.digestPreference.findUnique({ where: { userId: ctx.user.id } });
  const deliveries = await prisma.digestDelivery.findMany({
    where: { userId: ctx.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AppShell
      title="Reminders"
      subtitle="Daily or weekly privacy-filtered checklist digests"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DigestSettingsForm
          initial={{
            cadence: prefs?.cadence ?? "off",
            deliveryLocalTime: prefs?.deliveryLocalTime ?? "08:00",
            weeklyDay: prefs?.weeklyDay ?? 1,
            timezone: prefs?.timezone ?? "Asia/Tokyo",
            includeActivePhase: prefs?.includeActivePhase ?? true,
            includeOverdue: prefs?.includeOverdue ?? true,
            includeWaiting: prefs?.includeWaiting ?? false,
            upcomingDays: prefs?.upcomingDays ?? 7,
            sendEmptyDigest: prefs?.sendEmptyDigest ?? false,
          }}
        />
        <Panel title="Recent digest deliveries">
          {deliveries.length === 0 ? (
            <EmptyState
              title="No digests queued yet"
              description="Send a test digest from the form."
            />
          ) : (
            <ul className="space-y-3 text-sm">
              {deliveries.map((delivery) => (
                <li key={delivery.id} className="rounded-xl border border-border/70 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    {delivery.cadence}
                    <Badge variant="outline">{delivery.status}</Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {delivery.taskCount} tasks · {delivery.scheduledPeriodKey}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
