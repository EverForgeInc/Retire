import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import {
  calculateAllSectionWindows,
  daysUntilRetirement,
  findActivePhase,
  phaseIndex,
  toDateOnly,
} from "@/lib/rules/date-engine";

const APPLICABLE = ["not_started", "in_progress", "waiting", "complete"] as const;

export async function buildDashboard(memberProfileId: string) {
  const profile = await prisma.memberProfile.findUniqueOrThrow({
    where: { id: memberProfileId },
  });
  const tasks = await prisma.memberTask.findMany({
    where: { memberProfileId },
    orderBy: [{ sortOrder: "asc" }],
  });

  const today = startOfDay(new Date());
  const in7 = addDays(today, 7);
  const applicable = tasks.filter((t) => t.status !== "not_applicable");
  const complete = applicable.filter((t) => t.status === "complete");
  const overdue = applicable.filter(
    (t) =>
      t.status !== "complete" &&
      t.calculatedEnd != null &&
      startOfDay(t.calculatedEnd) < today,
  );
  const waiting = applicable.filter((t) => t.status === "waiting");
  const dueSoon = applicable.filter((t) => {
    if (t.status === "complete") return false;
    if (!t.calculatedEnd) return false;
    const end = startOfDay(t.calculatedEnd);
    return end >= today && end <= in7;
  });
  const upcoming = applicable
    .filter((t) => t.status !== "complete")
    .filter((t) => t.calculatedEnd == null || startOfDay(t.calculatedEnd) >= today)
    .sort((a, b) => {
      const ae = a.calculatedEnd?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const be = b.calculatedEnd?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ae - be;
    })
    .slice(0, 5);

  const activePhase = findActivePhase(profile.projectedRetirementDate, today);
  const phaseTasks = applicable.filter((t) => t.sectionId === activePhase.sectionId);
  const phaseComplete = phaseTasks.filter((t) => t.status === "complete");
  const sections = calculateAllSectionWindows(profile.projectedRetirementDate).map((window) => {
    const sectionTasks = applicable.filter((t) => t.sectionId === window.sectionId);
    const sectionComplete = sectionTasks.filter((t) => t.status === "complete");
    return {
      sectionId: window.sectionId,
      label: window.label,
      phase: phaseIndex(window.sectionId),
      start: toDateOnly(window.start),
      end: window.end ? toDateOnly(window.end) : null,
      complete: sectionComplete.length,
      total: sectionTasks.length,
      percent:
        sectionTasks.length === 0
          ? 0
          : Math.round((sectionComplete.length / sectionTasks.length) * 100),
      isActive: window.sectionId === activePhase.sectionId,
    };
  });

  const progressPercent =
    applicable.length === 0 ? 0 : Math.round((complete.length / applicable.length) * 100);

  return {
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      rank: profile.rank,
      projectedRetirementDate: toDateOnly(profile.projectedRetirementDate),
      skillbridgeStart: profile.skillbridgeStart ? toDateOnly(profile.skillbridgeStart) : null,
      skillbridgeEnd: profile.skillbridgeEnd ? toDateOnly(profile.skillbridgeEnd) : null,
      terminalLeaveStart: profile.terminalLeaveStart
        ? toDateOnly(profile.terminalLeaveStart)
        : null,
      finalDutyDay: profile.finalDutyDay ? toDateOnly(profile.finalDutyDay) : null,
      retirementLocation: profile.retirementLocation,
      installation: profile.installation,
    },
    metrics: {
      daysToRetirement: daysUntilRetirement(profile.projectedRetirementDate, today),
      progressPercent,
      completeCount: complete.length,
      applicableCount: applicable.length,
      dueSoonCount: dueSoon.length,
      overdueCount: overdue.length,
      waitingCount: waiting.length,
    },
    currentPhase: {
      sectionId: activePhase.sectionId,
      label: activePhase.label,
      phase: phaseIndex(activePhase.sectionId),
      totalPhases: 14,
      complete: phaseComplete.length,
      total: phaseTasks.length,
      percent:
        phaseTasks.length === 0
          ? 0
          : Math.round((phaseComplete.length / phaseTasks.length) * 100),
      start: toDateOnly(activePhase.start),
      end: activePhase.end ? toDateOnly(activePhase.end) : null,
    },
    upcomingTasks: upcoming.map(serializeTask),
    dueThisWeek: dueSoon.map(serializeTask),
    overdueTasks: overdue.map(serializeTask),
    sections,
    disclaimer:
      "Military Retirement Planner is not an official Department of Defense or U.S. government system. Verify all requirements with your local offices and official sources.",
  };
}

export function serializeTask(task: {
  id: string;
  title: string;
  sectionId: string | null;
  sectionName: string | null;
  status: string;
  calculatedStart: Date | null;
  calculatedEnd: Date | null;
  dateCompleted: Date | null;
  ownerLabel: string | null;
  requiredLevel: string | null;
  notes: string | null;
  outsideWindow: boolean;
  dateOverride: boolean;
  sortOrder: number;
}) {
  return {
    id: task.id,
    title: task.title,
    sectionId: task.sectionId,
    sectionName: task.sectionName,
    status: task.status,
    calculatedStart: task.calculatedStart ? toDateOnly(task.calculatedStart) : null,
    calculatedEnd: task.calculatedEnd ? toDateOnly(task.calculatedEnd) : null,
    dateCompleted: task.dateCompleted ? toDateOnly(task.dateCompleted) : null,
    ownerLabel: task.ownerLabel,
    requiredLevel: task.requiredLevel,
    notes: task.notes,
    outsideWindow: task.outsideWindow,
    dateOverride: task.dateOverride,
    sortOrder: task.sortOrder,
  };
}

export { APPLICABLE };
