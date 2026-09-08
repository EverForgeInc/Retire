import { handleRouteError, PublicApiError, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { profile, user } = await requireMemberContext();
    const [tasks, evidence, conditions, limitations, scenarios, locations, auditEvents] = await Promise.all([
      prisma.memberTask.findMany({ where: { memberProfileId: profile.id }, orderBy: { sortOrder: "asc" } }),
      prisma.evidenceReference.findMany({ where: { memberProfileId: profile.id }, orderBy: { createdAt: "asc" } }),
      prisma.vaCondition.findMany({ where: { memberProfileId: profile.id }, orderBy: { createdAt: "asc" } }),
      prisma.vaFunctionalLimitation.findMany({ where: { vaCondition: { memberProfileId: profile.id } }, orderBy: { createdAt: "asc" } }),
      prisma.transitionScenario.findMany({ where: { memberProfileId: profile.id }, include: { events: true } }),
      prisma.savedLocation.findMany({ where: { memberProfileId: profile.id } }),
      prisma.auditEvent.findMany({ where: { memberProfileId: profile.id }, orderBy: { createdAt: "asc" } }),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      format: "military-retirement-planner-account-export-v1",
      disclaimer: "Not an official DoD system. This export contains no Social Security number fields.",
      account: { email: user.email, displayName: user.displayName },
      profile,
      tasks,
      evidence,
      vaConditions: conditions,
      vaFunctionalLimitations: limitations,
      transitionScenarios: scenarios,
      savedLocations: locations,
      auditEvents,
    };
    const serialized = JSON.stringify(payload);
    if (/"ssn"|last4|socialSecurity/i.test(serialized)) {
      throw new PublicApiError("Export blocked: forbidden identity fields detected");
    }

    return new Response(serialized, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="retirement-planner-account-export.json"',
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
