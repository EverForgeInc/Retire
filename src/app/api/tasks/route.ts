import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { serializeTask } from "@/lib/dashboard";

export async function GET(request: Request) {
  try {
    const { profile } = await requireMemberContext();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const sectionId = searchParams.get("sectionId") ?? undefined;
    const q = searchParams.get("q")?.toLowerCase();

    const tasks = await prisma.memberTask.findMany({
      where: {
        memberProfileId: profile.id,
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(sectionId ? { sectionId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }],
    });

    const filtered = q
      ? tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.sectionName ?? "").toLowerCase().includes(q) ||
            (t.ownerLabel ?? "").toLowerCase().includes(q),
        )
      : tasks;

    return jsonOk({ tasks: filtered.map(serializeTask) });
  } catch (error) {
    return handleRouteError(error);
  }
}
