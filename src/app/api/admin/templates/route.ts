import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const templates = await prisma.checklistTemplate.findMany({
      include: {
        tasks: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        branch: t.branch,
        component: t.component,
        version: t.version,
        active: t.active,
        taskCount: t.tasks.length,
        tasks: t.tasks.map((task) => ({
          id: task.id,
          externalKey: task.externalKey,
          sectionId: task.sectionId,
          sectionName: task.sectionName,
          title: task.title,
          ownerLabel: task.ownerLabel,
          requiredLevel: task.requiredLevel,
          sortOrder: task.sortOrder,
          localOverrideAllowed: task.localOverrideAllowed,
        })),
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
