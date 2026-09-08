import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import {
  calculateAllSectionWindows,
  daysUntilRetirement,
  findActivePhase,
  parseDateOnly,
  phaseIndex,
  toDateOnly,
} from "@/lib/rules/date-engine";

const APPLICABLE = ["not_started", "in_progress", "waiting", "complete"] as const;

export type ActionQueueKind =
  | "overdue"
  | "due_soon"
  | "waiting"
  | "follow_up_due"
  | "bdd_deadline_warning"
  | "major_milestone"
  | "claim_workflow"
  | "skillbridge"
  | "missing_critical_task";

export type ActionQueueItem = {
  id: string;
  kind: ActionQueueKind;
  title: string;
  detail: string;
  date?: string | null;
  relatedTaskId?: string | null;
  priority: number;
};

export function deriveActionQueue(
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    sectionName: string | null;
    calculatedEnd: Date | null;
    followUpDate: Date | null;
    waitingOnWho: string | null;
    waitingOnWhat: string | null;
  }>,
  profile: { authoritativeRetirementDate: string | Date; claimWorkflowState?: string | null },
  today: Date = new Date(),
): ActionQueueItem[] {
  const now = startOfDay(today);
  const dueSoonDays = 7;
  const queue: ActionQueueItem[] = [];
  const seen = new Set<string>();

  const push = (item: ActionQueueItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    queue.push(item);
  };

  for (const task of tasks) {
    if (task.status === "complete" || task.status === "not_applicable") continue;

    const dueDate = task.followUpDate ?? task.calculatedEnd;
    const due = dueDate ? startOfDay(dueDate) : null;
    if (task.status === "waiting" && task.waitingOnWho) {
      push({
        id: `waiting-${task.id}`,
        kind: "waiting",
        title: task.title,
        detail: `Waiting on ${task.waitingOnWho}${task.waitingOnWhat ? ` for ${task.waitingOnWhat}` : ""}`,
        date: due ? toDateOnly(due) : null,
        relatedTaskId: task.id,
        priority: 80,
      });
    }

    if (due && due < now) {
      push({
        id: `overdue-${task.id}`,
        kind: "overdue",
        title: task.title,
        detail: task.sectionName ? `Overdue in ${task.sectionName}` : "Overdue task",
        date: toDateOnly(due),
        relatedTaskId: task.id,
        priority: 100,
      });
    }

    if (due && due >= now && due <= addDays(now, dueSoonDays)) {
      push({
        id: `due-soon-${task.id}`,
        kind: "due_soon",
        title: task.title,
        detail: task.sectionName ? `Due soon in ${task.sectionName}` : "Due soon",
        date: toDateOnly(due),
        relatedTaskId: task.id,
        priority: 60,
      });
    }

    if (task.followUpDate && task.followUpDate <= now) {
      push({
        id: `follow-up-${task.id}`,
        kind: "follow_up_due",
        title: task.title,
        detail: "Follow-up date has arrived",
        date: toDateOnly(task.followUpDate),
        relatedTaskId: task.id,
        priority: 70,
      });
    }
  }

  const retirementDate = parseDateOnly(profile.authoritativeRetirementDate);
  const daysRemaining = daysUntilRetirement(retirementDate, now);
  if (profile.claimWorkflowState && ["not_started", "planning", "bdd_eligible"].includes(profile.claimWorkflowState) && daysRemaining >= 90 && daysRemaining <= 180) {
    push({
      id: "bdd-deadline-warning",
      kind: "bdd_deadline_warning",
      title: "BDD filing window is active",
      detail: `Retirement is ${daysRemaining} days away. Confirm BDD eligibility and timing before the window closes.`,
      date: toDateOnly(retirementDate),
      priority: 90,
    });
  }

  if (profile.claimWorkflowState === "bdd_filed") {
    push({
      id: "claim-workflow-bdd",
      kind: "claim_workflow",
      title: "BDD claim is filed",
      detail: "Keep evidence, exam requests, and claim updates moving while the routing remains active.",
      date: toDateOnly(retirementDate),
      priority: 50,
    });
  }

  return queue.sort((a, b) => b.priority - a.priority || (a.date ?? "9999-12-31").localeCompare(b.date ?? "9999-12-31"));
}

export async function buildDashboard(memberProfileId: string) {
  const profile = await prisma.memberProfile.findUniqueOrThrow({
    where: { id: memberProfileId },
  });
  const tasks = await prisma.memberTask.findMany({
    where: { memberProfileId },
    orderBy: [{ sortOrder: "asc" }],
  });

  const today = startOfDay(new Date());
  const authoritativeRetirementDate = profile.officialSeparationDate ?? profile.projectedRetirementDate;
  const in7 = addDays(today, 7);
  const applicable = tasks.filter((t) => t.status !== "not_applicable");
  const complete = applicable.filter((t) => t.status === "complete");
  const overdue = applicable.filter(
    (t) =>
      t.status !== "complete" &&
      (t.followUpDate ?? t.calculatedEnd) != null &&
      startOfDay(t.followUpDate ?? t.calculatedEnd!) < today,
  );
  const waiting = applicable.filter((t) => t.status === "waiting");
  const dueSoon = applicable.filter((t) => {
    if (t.status === "complete") return false;
    const dueDate = t.followUpDate ?? t.calculatedEnd;
    if (!dueDate) return false;
    const end = startOfDay(dueDate);
    return end >= today && end <= in7;
  });
  const upcoming = applicable
    .filter((t) => t.status !== "complete")
    .filter((t) => {
      const dueDate = t.followUpDate ?? t.calculatedEnd;
      return dueDate == null || startOfDay(dueDate) >= today;
    })
    .sort((a, b) => {
      const ae = (a.followUpDate ?? a.calculatedEnd)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const be = (b.followUpDate ?? b.calculatedEnd)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return ae - be;
    })
    .slice(0, 5);

  const activePhase = findActivePhase(authoritativeRetirementDate, today);
  const phaseTasks = applicable.filter((t) => t.sectionId === activePhase.sectionId);
  const phaseComplete = phaseTasks.filter((t) => t.status === "complete");
  const sections = calculateAllSectionWindows(authoritativeRetirementDate).map((window) => {
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
  const actionQueue = deriveActionQueue(
    tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      sectionName: task.sectionName,
      calculatedEnd: task.calculatedEnd,
      followUpDate: task.followUpDate,
      waitingOnWho: task.waitingOnWho,
      waitingOnWhat: task.waitingOnWhat,
    })),
    {
      authoritativeRetirementDate: authoritativeRetirementDate,
      claimWorkflowState: profile.claimWorkflowState,
    },
    today,
  );

  return {
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      rank: profile.rank,
      projectedRetirementDate: toDateOnly(profile.projectedRetirementDate),
      officialSeparationDate: profile.officialSeparationDate ? toDateOnly(profile.officialSeparationDate) : null,
      authoritativeRetirementDate: toDateOnly(authoritativeRetirementDate),
      retirementDateSource: profile.officialSeparationDate ? "official" : "projected",
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
      daysToRetirement: daysUntilRetirement(authoritativeRetirementDate, today),
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
    actionQueue,
    nextBestAction: actionQueue[0] ?? null,
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
  waitingOnWho: string | null;
  waitingOnWhat: string | null;
  followUpDate: Date | null;
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
    waitingOnWho: task.waitingOnWho,
    waitingOnWhat: task.waitingOnWhat,
    followUpDate: task.followUpDate ? toDateOnly(task.followUpDate) : null,
    ownerLabel: task.ownerLabel,
    requiredLevel: task.requiredLevel,
    notes: task.notes,
    outsideWindow: task.outsideWindow,
    dateOverride: task.dateOverride,
    sortOrder: task.sortOrder,
  };
}

export { APPLICABLE };
