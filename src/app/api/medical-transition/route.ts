import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { parseDateOnly } from "@/lib/rules/date-engine";
import { getStatusForEvent } from "@/lib/rules/medical-transition";
import { assertNoSsnFields, medicalTransitionEventSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const events = await prisma.medicalTransitionEvent.findMany({ where: { memberProfileId: profile.id }, orderBy: { occurredAt: "asc" } });
    return jsonOk({ events, status: profile.desIdesStatus });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { profile, session } = await requireMemberContext();
    const body = await request.json();
    assertNoSsnFields(body);
    const data = medicalTransitionEventSchema.parse(body);
    const event = await prisma.medicalTransitionEvent.create({
      data: { memberProfileId: profile.id, eventType: data.eventType, occurredAt: parseDateOnly(data.occurredAt), notes: data.notes },
    });
    await prisma.memberProfile.update({ where: { id: profile.id }, data: { desIdesStatus: getStatusForEvent(data.eventType) } });
    await writeAudit({ userId: session.userId, memberProfileId: profile.id, entityType: "medical_transition_event", entityId: event.id, action: "created", afterValue: data });
    return jsonOk({ event }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}