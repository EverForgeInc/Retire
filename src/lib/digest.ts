import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import { findActivePhase, toDateOnly } from "@/lib/rules/date-engine";

export type DigestTaskLine = {
  id: string;
  title: string;
  sectionName: string | null;
  calculatedEnd: string | null;
  status: string;
  deepLink: string;
};

/** Builds a privacy-filtered checklist digest (no medical/VA narratives). */
export async function buildDigestPayload(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      digestPreferences: true,
      profile: true,
    },
  });

  const prefs = user.digestPreferences;
  const profile = user.profile;
  if (!prefs || !profile) {
    return { skipped: true as const, reason: "missing_prefs_or_profile", tasks: [] as DigestTaskLine[] };
  }
  if (prefs.cadence === "off" || prefs.unsubscribedAt || (prefs.pausedUntil && prefs.pausedUntil > new Date())) {
    return { skipped: true as const, reason: "paused_or_off", tasks: [] as DigestTaskLine[] };
  }

  const today = startOfDay(new Date());
  const active = findActivePhase(profile.projectedRetirementDate, today);
  const tasks = await prisma.memberTask.findMany({
    where: {
      memberProfileId: profile.id,
      status: { notIn: ["complete", "not_applicable"] },
    },
    orderBy: { sortOrder: "asc" },
  });

  const selected: DigestTaskLine[] = [];
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  for (const task of tasks) {
    const end = task.calculatedEnd ? startOfDay(task.calculatedEnd) : null;
    const overdue = end != null && end < today;
    const inActivePhase = prefs.includeActivePhase && task.sectionId === active.sectionId;
    const waiting = prefs.includeWaiting && task.status === "waiting";
    const upcoming =
      end != null &&
      end >= today &&
      end <= addDays(today, prefs.upcomingDays);

    if ((prefs.includeOverdue && overdue) || inActivePhase || waiting || upcoming) {
      selected.push({
        id: task.id,
        title: task.title,
        sectionName: task.sectionName,
        calculatedEnd: end ? toDateOnly(end) : null,
        status: task.status,
        deepLink: `${appUrl}/checklist/${task.id}`,
      });
    }
  }

  if (selected.length === 0 && !prefs.sendEmptyDigest) {
    return { skipped: true as const, reason: "empty", tasks: selected, prefs, profile };
  }

  return {
    skipped: false as const,
    reason: null,
    tasks: selected,
    prefs,
    profile,
    subject: `Retirement checklist digest (${selected.length} items)`,
    bodyLines: selected.map(
      (t) => `- ${t.title}${t.calculatedEnd ? ` (due ${t.calculatedEnd})` : ""}: ${t.deepLink}`,
    ),
  };
}

export async function queueTestDigest(userId: string) {
  const payload = await buildDigestPayload(userId);
  const periodKey = `test-${new Date().toISOString()}`;
  const delivery = await prisma.digestDelivery.create({
    data: {
      userId,
      scheduledPeriodKey: periodKey,
      cadence: payload.prefs?.cadence ?? "off",
      taskCount: payload.tasks.length,
      status: payload.skipped ? "skipped" : "queued",
      providerMessageId: payload.skipped ? null : `local-test-${Date.now()}`,
      sentAt: payload.skipped ? null : new Date(),
    },
  });
  return { delivery, payload };
}
