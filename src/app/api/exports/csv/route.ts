import { handleRouteError, PublicApiError, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { toDateOnly } from "@/lib/rules/date-engine";
import { csvEscape } from "@/lib/rules/csv";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const tasks = await prisma.memberTask.findMany({
      where: { memberProfileId: profile.id },
      orderBy: { sortOrder: "asc" },
    });

    const header = [
      "task_id",
      "section",
      "title",
      "status",
      "calculated_start",
      "calculated_end",
      "date_completed",
      "owner",
      "notes",
    ];
    const rows = tasks.map((t) =>
      [
        t.externalKey ?? t.id,
        t.sectionName,
        t.title,
        t.status,
        t.calculatedStart ? toDateOnly(t.calculatedStart) : "",
        t.calculatedEnd ? toDateOnly(t.calculatedEnd) : "",
        t.dateCompleted ? toDateOnly(t.dateCompleted) : "",
        t.ownerLabel,
        t.notes,
      ]
        .map((v) => csvEscape(v))
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    if (/ssn|last4|social.?security/i.test(csv)) {
      throw new PublicApiError("Export blocked: forbidden identity fields detected");
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="retirement-checklist.csv"',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
