import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { assertNoSsnFields, vaConditionSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const conditions = await prisma.vaCondition.findMany({
      where: { memberProfileId: profile.id },
      include: { limitations: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({
      conditions,
      disclaimer:
        "This tracker organizes your own observations and evidence. It does not diagnose conditions, coach exaggeration, or predict a VA rating.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { profile, session } = await requireMemberContext();
    const body = await request.json();
    assertNoSsnFields(body);
    const data = vaConditionSchema.parse(body);
    if (data.secondaryConditionId) {
      const related = await prisma.vaCondition.findFirst({ where: { id: data.secondaryConditionId, memberProfileId: profile.id } });
      if (!related) return new Response(JSON.stringify({ error: "Referenced condition was not found" }), { status: 400 });
    }

    const created = await prisma.vaCondition.create({
      data: {
        memberProfileId: profile.id,
        conditionName: data.conditionName,
        bodySystem: data.bodySystem,
        bodyRegion: data.bodyRegion,
        laterality: data.laterality,
        diagnosisStatus: data.diagnosisStatus,
        onsetOrServiceEvent: data.onsetOrServiceEvent,
        symptoms: data.symptoms,
        flareUps: data.flareUps,
        functionalImpactNarrative: data.functionalImpactNarrative,
        treatmentHistory: data.treatmentHistory,
        claimStatus: data.claimStatus,
        examStatus: data.examStatus,
        memberPrimaryTheory: data.memberPrimaryTheory,
        memberAlternateTheory: data.memberAlternateTheory,
        representativePrimaryTheory: data.representativePrimaryTheory,
        representativeAlternateTheory: data.representativeAlternateTheory,
        vaFinalPrimaryDetermination: data.vaFinalPrimaryDetermination,
        vaFinalAlternateDetermination: data.vaFinalAlternateDetermination,
        secondaryConditionId: data.secondaryConditionId,
        limitations: data.limitations
          ? {
              create: data.limitations.map((l) => ({
                activity: l.activity,
                limitationDescription: l.limitationDescription,
                thresholdValue: l.thresholdValue,
                thresholdUnit: l.thresholdUnit,
                frequency: l.frequency,
                severity: l.severity,
                flareImpact: l.flareImpact,
                accommodationOrDevice: l.accommodationOrDevice,
              })),
            }
          : undefined,
      },
      include: { limitations: true },
    });

    await writeAudit({
      userId: session.userId,
      memberProfileId: profile.id,
      entityType: "va_condition",
      entityId: created.id,
      action: "created",
      afterValue: { id: created.id, conditionName: created.conditionName },
    });

    return jsonOk({ condition: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
