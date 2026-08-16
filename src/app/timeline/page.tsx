import { AppShell } from "@/components/layout/AppShell";
import {
  TimelineKpiCards,
  TransitionEventsList,
  TransitionMonthCalendar,
  type TimelineCalendarEvent,
} from "@/components/timeline/TimelineCalendar";
import { getDashboardForPage } from "@/lib/server-data";
import { prisma } from "@/lib/db";
import {
  buildDefaultTransitionEvents,
  detectOverlaps,
  inclusiveDayCount,
  isChargeableLeave,
  projectLeaveBalance,
  type TimelineEventType,
} from "@/lib/rules/leave";

export default async function TimelinePage() {
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

  const events: TimelineCalendarEvent[] = scenario.events.map((e) => ({
    id: e.id,
    eventType: e.eventType as TimelineEventType,
    title: e.title,
    startDate: e.startDate,
    endDate: e.endDate,
    chargeableLeave: e.chargeableLeave,
  }));

  const overlaps = detectOverlaps(events);
  const chargeableDays = events
    .filter((e) => e.chargeableLeave)
    .reduce((sum, e) => sum + inclusiveDayCount(e.startDate, e.endDate), 0);
  const leave = projectLeaveBalance({
    currentBalance: scenario.currentLeaveBalance ?? 0,
    accrualPerMonth: scenario.leaveAccrualPerMonth,
    monthsRemaining: 6,
    chargeableDaysUsed: chargeableDays,
  });

  const focusMonth =
    ctx.profile!.terminalLeaveStart ??
    ctx.profile!.skillbridgeEnd ??
    ctx.profile!.projectedRetirementDate;

  return (
    <AppShell
      title="Timeline & Leave Plan"
      subtitle="SkillBridge, leave, and final-out planning"
      progress={{
        percent: dashboard.metrics.progressPercent,
        complete: dashboard.metrics.completeCount,
        total: dashboard.metrics.applicableCount,
        days: dashboard.metrics.daysToRetirement,
        retirementDate: dashboard.profile.projectedRetirementDate,
      }}
    >
      <div className="space-y-4">
        <TimelineKpiCards
          chargeableLeaveDays={chargeableDays}
          projectedBalance={leave.projectedBalance}
          overlapCount={overlaps.length}
        />

        {leave.useOrLoseWarning ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Use-or-lose risk: projected leave balance exceeds 60 days.
          </p>
        ) : null}

        <TransitionMonthCalendar events={events} initialMonth={focusMonth} />
        <TransitionEventsList events={events} />
      </div>
    </AppShell>
  );
}
