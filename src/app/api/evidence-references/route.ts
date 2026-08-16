import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { parseDateOnly } from "@/lib/rules/date-engine";
import { assertNoSsnFields, evidenceReferenceSchema } from "@/lib/validation";

const BLOCKED_HEALTH_CATEGORIES = [
  "medical",
  "dental",
  "behavioral-health",
  "behavioral_health",
  "va examination",
  "va_examination",
  "health",
];

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const items = await prisma.evidenceReference.findMany({
      where: { memberProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ evidenceReferences: items });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { profile, session } = await requireMemberContext();
    const body = await request.json();
    assertNoSsnFields(body);
    const data = evidenceReferenceSchema.parse(body);

    const category = (data.recordCategory || "").toLowerCase();
    const medicalUploadsAllowed = process.env.ALLOW_MEDICAL_UPLOADS === "true";
    if (
      !medicalUploadsAllowed &&
      data.evidenceType === "permitted_nonmedical_attachment" &&
      BLOCKED_HEALTH_CATEGORIES.some((c) => category.includes(c))
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Medical and health-document uploads are disabled in the MVP. Use an external secure-storage reference instead.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    const created = await prisma.evidenceReference.create({
      data: {
        memberProfileId: profile.id,
        memberTaskId: data.memberTaskId,
        evidenceType: data.evidenceType,
        recordCategory: data.recordCategory,
        facilityOrOffice: data.facilityOrOffice,
        requestDate: data.requestDate ? parseDateOnly(data.requestDate) : null,
        receivedDate: data.receivedDate ? parseDateOnly(data.receivedDate) : null,
        completeness: data.completeness,
        confirmationNumber: data.confirmationNumber,
        summary: data.summary,
        externalStorageLabel: data.externalStorageLabel,
        sensitiveHealthMetadata: BLOCKED_HEALTH_CATEGORIES.some((c) => category.includes(c)),
      },
    });

    await writeAudit({
      userId: session.userId,
      memberProfileId: profile.id,
      entityType: "evidence_reference",
      entityId: created.id,
      action: "created",
      afterValue: created,
    });

    return jsonOk({ evidenceReference: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
