import { handleRouteError, jsonOk, PublicApiError, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { assertNoSsnFields, vaConditionSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

async function getOwnedCondition(id: string, memberProfileId: string) {
  return prisma.vaCondition.findFirst({ where: { id, memberProfileId }, include: { limitations: true } });
}

function assertValidSecondary(id: string, secondaryConditionId: string | null | undefined, related: { id: string; memberProfileId: string } | null) {
  if (!secondaryConditionId) return;
  if (secondaryConditionId === id || !related) throw new Error("Referenced condition was not found for this member");
  if (secondaryConditionId === id || !related) throw new PublicApiError("Referenced condition was not found for this member");
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const { profile, session } = await requireMemberContext();
    const { id } = await params;
    const existing = await getOwnedCondition(id, profile.id);
    if (!existing) return new Response(JSON.stringify({ error: "Condition not found" }), { status: 404 });
    const body = await request.json();
    assertNoSsnFields(body);
    const data = vaConditionSchema.parse(body);
    const related = data.secondaryConditionId
      ? await prisma.vaCondition.findFirst({ where: { id: data.secondaryConditionId, memberProfileId: profile.id }, select: { id: true, memberProfileId: true } })
      : null;
    assertValidSecondary(id, data.secondaryConditionId, related);
    const updated = await prisma.$transaction(async (tx) => {
      await tx.vaFunctionalLimitation.deleteMany({ where: { vaConditionId: id } });
      return tx.vaCondition.update({
        where: { id },
        data: {
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
          limitations: data.limitations ? { create: data.limitations } : undefined,
        },
        include: { limitations: true },
      });
    });
    await writeAudit({ userId: session.userId, memberProfileId: profile.id, entityType: "va_condition", entityId: id, action: "updated", afterValue: { id, conditionName: updated.conditionName } });
    return jsonOk({ condition: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { profile, session } = await requireMemberContext();
    const { id } = await params;
    const existing = await getOwnedCondition(id, profile.id);
    if (!existing) return new Response(JSON.stringify({ error: "Condition not found" }), { status: 404 });
    await prisma.vaCondition.delete({ where: { id } });
    await writeAudit({ userId: session.userId, memberProfileId: profile.id, entityType: "va_condition", entityId: id, action: "deleted", afterValue: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}