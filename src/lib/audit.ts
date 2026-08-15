import { prisma } from "@/lib/db";

export async function writeAudit(params: {
  userId?: string | null;
  memberProfileId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  beforeValue?: unknown;
  afterValue?: unknown;
}) {
  return prisma.auditEvent.create({
    data: {
      userId: params.userId ?? undefined,
      memberProfileId: params.memberProfileId ?? undefined,
      entityType: params.entityType,
      entityId: params.entityId ?? undefined,
      action: params.action,
      beforeValue: params.beforeValue === undefined ? undefined : JSON.stringify(params.beforeValue),
      afterValue: params.afterValue === undefined ? undefined : JSON.stringify(params.afterValue),
    },
  });
}
