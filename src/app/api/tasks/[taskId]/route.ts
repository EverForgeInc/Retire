import { handleRouteError, jsonError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { serializeTask } from "@/lib/dashboard";
import { prisma } from "@/lib/db";
import { parseDateOnly } from "@/lib/rules/date-engine";
import { assertNoSsnFields, taskUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ taskId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { profile } = await requireMemberContext();
    const { taskId } = await params;
    const task = await prisma.memberTask.findFirst({
      where: { id: taskId, memberProfileId: profile.id },
      include: { evidenceRefs: true },
    });
    if (!task) return jsonError("Task not found", 404);
    return jsonOk({ task: serializeTask(task), evidenceReferences: task.evidenceRefs });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { profile, session } = await requireMemberContext();
    const { taskId } = await params;
    const body = await request.json();
    assertNoSsnFields(body);
    const data = taskUpdateSchema.parse(body);

    const existing = await prisma.memberTask.findFirst({
      where: { id: taskId, memberProfileId: profile.id },
    });
    if (!existing) return jsonError("Task not found", 404);

    const nextStatus = data.status ?? existing.status;
    const update = {
      status: nextStatus,
      autoSuppressed: false,
      waitingOnWho: data.waitingOnWho === undefined ? existing.waitingOnWho : data.waitingOnWho,
      waitingOnWhat: data.waitingOnWhat === undefined ? existing.waitingOnWhat : data.waitingOnWhat,
      followUpDate:
        data.followUpDate === undefined
          ? existing.followUpDate
          : data.followUpDate
            ? parseDateOnly(data.followUpDate)
            : null,
      notes: data.notes === undefined ? existing.notes : data.notes,
      dateCompleted:
        data.dateCompleted === undefined
          ? existing.dateCompleted
          : data.dateCompleted
            ? parseDateOnly(data.dateCompleted)
            : null,
      manualDueDate:
        data.manualDueDate === undefined
          ? existing.manualDueDate
          : data.manualDueDate
            ? parseDateOnly(data.manualDueDate)
            : null,
      dateOverride: data.dateOverride ?? existing.dateOverride,
      completedAt: existing.completedAt,
      completedByUserId: existing.completedByUserId,
    };

    if (nextStatus === "complete" && existing.status !== "complete") {
      update.completedAt = new Date();
      update.completedByUserId = session.userId;
      if (!update.dateCompleted) update.dateCompleted = parseDateOnly(new Date());
    }
    if (nextStatus !== "complete" && existing.status === "complete") {
      update.completedAt = null;
      update.completedByUserId = null;
    }

    const task = await prisma.memberTask.update({
      where: { id: existing.id },
      data: update,
    });

    await writeAudit({
      userId: session.userId,
      memberProfileId: profile.id,
      entityType: "member_task",
      entityId: task.id,
      action: "updated",
      beforeValue: serializeTask(existing),
      afterValue: serializeTask(task),
    });

    return jsonOk({ task: serializeTask(task) });
  } catch (error) {
    return handleRouteError(error);
  }
}
