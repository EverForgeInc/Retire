import { AppShell } from "@/components/layout/AppShell";
import { AnnualCalendarControls } from "@/components/timeline/AnnualCalendarControls";
import type { YearCalendarEvent } from "@/components/timeline/YearCalendar";
import { getDashboardForPage } from "@/lib/server-data";
import { prisma } from "@/lib/db";
import {
  buildDefaultTransitionEvents,
  isChargeableLeave,
  type TimelineEventType,
} from "@/lib/rules/leave";

export default async function AnnualCalendarPage() {
  const { ctx, dashboard } = await getDashboardForPage();
  let scenario = await prisma.transitionScenario.findFirst({
    where: { memberProfileId: ctx.profile!.id, active: true },
    include: { events: { orderBy: { startDate: "asc" } } },
  });

  if (!scenario) {
    const defaults = buildDefaultTransitionEvents(ctx.profile!);
    scenario = await prisma.transitionScenario.create({
      data: {
        memberProfileId: ctx.profile!.id,
        name: "Primary transition plan",
        projectedRetirementDate: ctx.profile!.projectedRetirementDate,
        currentLeaveBalance: 30,
        leaveAccrualPerMonth: 2.5,
        events: {
          create: defaults.map((e) => ({
            eventType: e.eventType,
            title: e.title,
            startDate: e.startDate,
            endDate: e.endDate,
            chargeableLeave: isChargeableLeave(e.eventType, e.chargeableLeave),
          })),
        },
      },
      include: { events: { orderBy: { startDate: "asc" } } },
    });
  }

  const events: YearCalendarEvent[] = scenario.events.map((e) => ({
    id: e.id,
    eventType: e.eventType as TimelineEventType,
    title: e.title,
    startDate: e.startDate,
    endDate: e.endDate,
    chargeableLeave: e.chargeableLeave,
  }));

  const retirementYear = ctx.profile!.projectedRetirementDate.getFullYear();

  return (
    <AppShell
      title="Annual Calendar"
      subtitle="Full-year view of work, leave, SkillBridge, TDY, and retirement timeline"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <AnnualCalendarControls
        events={events}
        retirementYear={retirementYear}
        retirementDate={ctx.profile!.projectedRetirementDate}
      />
    </AppShell>
  );
}
