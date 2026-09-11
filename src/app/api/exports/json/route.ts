import { handleRouteError, PublicApiError, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { toDateOnly } from "@/lib/rules/date-engine";

export async function GET() {
  try {
    const { profile, user } = await requireMemberContext();
    const tasks = await prisma.memberTask.findMany({
      where: { memberProfileId: profile.id },
      orderBy: { sortOrder: "asc" },
    });

    const payload = {
      exportedAt: new Date().toISOString(),
      disclaimer: "Not an official DoD system. Export contains no Social Security number fields.",
      member: {
        email: user.email,
        fullName: profile.fullName,
        rank: profile.rank,
        projectedRetirementDate: toDateOnly(profile.projectedRetirementDate),
        installation: profile.installation,
      },
      tasks: tasks.map((t) => ({
        id: t.externalKey ?? t.id,
        title: t.title,
        section: t.sectionName,
        status: t.status,
        calculatedStart: t.calculatedStart ? toDateOnly(t.calculatedStart) : null,
        calculatedEnd: t.calculatedEnd ? toDateOnly(t.calculatedEnd) : null,
        dateCompleted: t.dateCompleted ? toDateOnly(t.dateCompleted) : null,
        notes: t.notes,
        owner: t.ownerLabel,
      })),
    };

    const serialized = JSON.stringify(payload, null, 2);
    if (/"ssn"|last4|socialSecurity/i.test(serialized)) {
      throw new PublicApiError("Export blocked: forbidden identity fields detected");
    }

    return new Response(serialized, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="retirement-planner-backup.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
