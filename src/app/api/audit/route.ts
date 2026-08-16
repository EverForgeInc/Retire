import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const events = await prisma.auditEvent.findMany({
      where: { memberProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return jsonOk({
      events: events.map((e) => ({
        id: e.id,
        entityType: e.entityType,
        entityId: e.entityId,
        action: e.action,
        beforeValue: e.beforeValue ? JSON.parse(e.beforeValue) : null,
        afterValue: e.afterValue ? JSON.parse(e.afterValue) : null,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
