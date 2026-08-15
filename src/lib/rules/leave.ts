import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

export type TimelineEventType =
  | "duty"
  | "ordinary_leave"
  | "terminal_leave"
  | "ptdy"
  | "skillbridge"
  | "tdy"
  | "outprocessing"
  | "medical_va"
  | "weekend"
  | "federal_holiday"
  | "final_out"
  | "retirement"
  | "retirement_ceremony";

export interface TimelineEventInput {
  eventType: TimelineEventType;
  title: string;
  startDate: Date;
  endDate: Date;
  chargeableLeave?: boolean;
}

export interface OverlapConflict {
  aTitle: string;
  bTitle: string;
  startDate: Date;
  endDate: Date;
}

const CHARGEABLE: TimelineEventType[] = ["ordinary_leave", "terminal_leave"];

export function isChargeableLeave(eventType: TimelineEventType, explicit?: boolean): boolean {
  if (typeof explicit === "boolean") return explicit;
  return CHARGEABLE.includes(eventType);
}

export function inclusiveDayCount(start: Date, end: Date): number {
  return differenceInCalendarDays(startOfDay(end), startOfDay(start)) + 1;
}

export function detectOverlaps(events: TimelineEventInput[]): OverlapConflict[] {
  const conflicts: OverlapConflict[] = [];
  const sorted = [...events]
    .filter((e) => e.eventType !== "retirement_ceremony" && e.eventType !== "federal_holiday")
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const a = sorted[i];
      const b = sorted[j];
      if (b.startDate > a.endDate) break;
      const overlapStart = a.startDate > b.startDate ? a.startDate : b.startDate;
      const overlapEnd = a.endDate < b.endDate ? a.endDate : b.endDate;
      if (overlapStart <= overlapEnd) {
        conflicts.push({
          aTitle: a.title,
          bTitle: b.title,
          startDate: overlapStart,
          endDate: overlapEnd,
        });
      }
    }
  }
  return conflicts;
}

export function projectLeaveBalance(params: {
  currentBalance: number;
  accrualPerMonth: number;
  monthsRemaining: number;
  chargeableDaysUsed: number;
}): { projectedBalance: number; useOrLoseWarning: boolean } {
  const accrued = params.accrualPerMonth * params.monthsRemaining;
  const projected = params.currentBalance + accrued - params.chargeableDaysUsed;
  return {
    projectedBalance: Math.round(projected * 100) / 100,
    useOrLoseWarning: projected > 60,
  };
}

export function buildDefaultTransitionEvents(profile: {
  projectedRetirementDate: Date;
  skillbridgeStart?: Date | null;
  skillbridgeEnd?: Date | null;
  terminalLeaveStart?: Date | null;
  finalDutyDay?: Date | null;
}): TimelineEventInput[] {
  const rd = startOfDay(profile.projectedRetirementDate);
  const events: TimelineEventInput[] = [
    {
      eventType: "retirement",
      title: "Retirement Date",
      startDate: rd,
      endDate: rd,
      chargeableLeave: false,
    },
  ];

  if (profile.skillbridgeStart && profile.skillbridgeEnd) {
    events.push({
      eventType: "skillbridge",
      title: "SkillBridge",
      startDate: startOfDay(profile.skillbridgeStart),
      endDate: startOfDay(profile.skillbridgeEnd),
      chargeableLeave: false,
    });
  }

  if (profile.terminalLeaveStart) {
    const end = profile.finalDutyDay
      ? startOfDay(profile.finalDutyDay)
      : addDays(rd, -1);
    events.push({
      eventType: "terminal_leave",
      title: "Terminal Leave",
      startDate: startOfDay(profile.terminalLeaveStart),
      endDate: end,
      chargeableLeave: true,
    });
  }

  if (profile.finalDutyDay) {
    const fd = startOfDay(profile.finalDutyDay);
    events.push({
      eventType: "final_out",
      title: "Final Out / Final Duty Day",
      startDate: fd,
      endDate: fd,
      chargeableLeave: false,
    });
  }

  return events;
}
