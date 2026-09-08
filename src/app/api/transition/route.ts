import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import {
  buildDefaultTransitionEvents,
  detectOverlaps,
  inclusiveDayCount,
  isChargeableLeave,
  projectLeaveBalance,
  type TimelineEventType,
} from "@/lib/rules/leave";
import { toDateOnly } from "@/lib/rules/date-engine";
import { parseDateOnly } from "@/lib/rules/date-engine";
import { transitionScenarioSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { profile } = await requireMemberContext();
    const data = transitionScenarioSchema.parse(await request.json());
    const scenario = await prisma.transitionScenario.create({
      data: {
        memberProfileId: profile.id,
        name: data.name,
        projectedRetirementDate: profile.projectedRetirementDate,
        currentLeaveBalance: data.currentLeaveBalance ?? 30,
        leaveAccrualPerMonth: data.leaveAccrualPerMonth ?? 2.5,
        maximumSkillbridgeDays: data.maximumSkillbridgeDays,
        policyCombinationLimitDays: data.policyCombinationLimitDays,
        events: {
          create: (data.events ?? []).map((event) => ({
            eventType: event.eventType,
            title: event.title,
            startDate: parseDateOnly(event.startDate),
            endDate: parseDateOnly(event.endDate),
            chargeableLeave: isChargeableLeave(event.eventType, event.chargeableLeave),
          })),
        },
      },
      include: { events: { orderBy: { startDate: "asc" } } },
    });
    return jsonOk({ scenario: { id: scenario.id, name: scenario.name, eventCount: scenario.events.length } }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    let scenario = await prisma.transitionScenario.findFirst({
      where: { memberProfileId: profile.id, active: true },
      include: { events: { orderBy: { startDate: "asc" } } },
    });

    if (!scenario) {
      const defaults = buildDefaultTransitionEvents(profile);
      scenario = await prisma.transitionScenario.create({
        data: {
          memberProfileId: profile.id,
          name: "Primary transition plan",
          projectedRetirementDate: profile.projectedRetirementDate,
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

    const eventInputs = scenario.events.map((e) => ({
      eventType: e.eventType as TimelineEventType,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      chargeableLeave: e.chargeableLeave,
    }));
    const overlaps = detectOverlaps(eventInputs);
    const chargeableDays = scenario.events
      .filter((e) => e.chargeableLeave)
      .reduce((sum, e) => sum + inclusiveDayCount(e.startDate, e.endDate), 0);
    const leaveProjection = projectLeaveBalance({
      currentBalance: scenario.currentLeaveBalance ?? 0,
      accrualPerMonth: scenario.leaveAccrualPerMonth,
      monthsRemaining: 6,
      chargeableDaysUsed: chargeableDays,
    });

    return jsonOk({
      scenario: {
        id: scenario.id,
        name: scenario.name,
        projectedRetirementDate: toDateOnly(scenario.projectedRetirementDate),
        currentLeaveBalance: scenario.currentLeaveBalance,
        leaveAccrualPerMonth: scenario.leaveAccrualPerMonth,
        maximumSkillbridgeDays: scenario.maximumSkillbridgeDays,
        events: scenario.events.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          title: e.title,
          startDate: toDateOnly(e.startDate),
          endDate: toDateOnly(e.endDate),
          chargeableLeave: e.chargeableLeave,
          dayCount: inclusiveDayCount(e.startDate, e.endDate),
        })),
      },
      analysis: {
        chargeableLeaveDays: chargeableDays,
        overlaps,
        leaveProjection,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
