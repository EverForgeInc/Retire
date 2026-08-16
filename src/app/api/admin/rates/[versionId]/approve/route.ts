import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ versionId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const { versionId } = await params;

    const version = await prisma.benefitRateVersion.update({
      where: { id: versionId },
      data: {
        status: "approved",
        approvedAt: new Date(),
        approvedById: session.userId,
      },
    });

    await writeAudit({
      userId: session.userId,
      entityType: "benefit_rate_version",
      entityId: version.id,
      action: "approved",
      afterValue: { status: version.status, effectiveDate: version.effectiveDate },
    });

    return jsonOk({ version });
  } catch (error) {
    return handleRouteError(error);
  }
}
