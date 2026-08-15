import { prisma } from "@/lib/db";
import { getSectionWindowById, isDateInWindow, parseDateOnly } from "@/lib/rules/date-engine";
import { writeAudit } from "@/lib/audit";

export async function generateMemberTasks(params: {
  memberProfileId: string;
  retirementDate: Date | string;
  userId?: string;
}) {
  const retirementDate = parseDateOnly(params.retirementDate);
  const templates = await prisma.taskTemplate.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (templates.length === 0) {
    throw new Error("No task templates found. Run the seed script first.");
  }

  const existing = await prisma.memberTask.findMany({
    where: { memberProfileId: params.memberProfileId },
  });
  const byKey = new Map(existing.filter((t) => t.externalKey).map((t) => [t.externalKey!, t]));

  for (const template of templates) {
    const window = getSectionWindowById(retirementDate, template.sectionId);
    const current = byKey.get(template.externalKey);

    if (!current) {
      await prisma.memberTask.create({
        data: {
          memberProfileId: params.memberProfileId,
          taskTemplateId: template.id,
          externalKey: template.externalKey,
          sectionId: template.sectionId,
          sectionName: template.sectionName,
          title: template.title,
          category: template.category,
          ownerLabel: template.ownerLabel,
          calculatedStart: window.start,
          calculatedEnd: window.end,
          requiredLevel: template.requiredLevel,
          sortOrder: template.sortOrder,
          status: "not_started",
        },
      });
      continue;
    }

    if (current.dateOverride) continue;

    const outsideWindow =
      current.status === "complete" &&
      current.dateCompleted != null &&
      !isDateInWindow(current.dateCompleted, window.start, window.end);

    await prisma.memberTask.update({
      where: { id: current.id },
      data: {
        sectionId: template.sectionId,
        sectionName: template.sectionName,
        title: template.title,
        category: template.category,
        ownerLabel: template.ownerLabel,
        calculatedStart: window.start,
        calculatedEnd: window.end,
        requiredLevel: template.requiredLevel,
        sortOrder: template.sortOrder,
        outsideWindow,
      },
    });
  }

  if (params.userId) {
    await writeAudit({
      userId: params.userId,
      memberProfileId: params.memberProfileId,
      entityType: "member_tasks",
      entityId: params.memberProfileId,
      action: "generate_or_recalculate",
      afterValue: { retirementDate: retirementDate.toISOString(), templateCount: templates.length },
    });
  }

  return prisma.memberTask.count({ where: { memberProfileId: params.memberProfileId } });
}

export async function recalculateOnRetirementDateChange(params: {
  memberProfileId: string;
  previousDate: Date;
  nextDate: Date;
  userId: string;
}) {
  await writeAudit({
    userId: params.userId,
    memberProfileId: params.memberProfileId,
    entityType: "member_profile",
    entityId: params.memberProfileId,
    action: "retirement_date_changed",
    beforeValue: { projectedRetirementDate: params.previousDate.toISOString() },
    afterValue: { projectedRetirementDate: params.nextDate.toISOString() },
  });

  return generateMemberTasks({
    memberProfileId: params.memberProfileId,
    retirementDate: params.nextDate,
    userId: params.userId,
  });
}
