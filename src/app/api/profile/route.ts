import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { getSession, getSessionProfile } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { parseDateOnly, toDateOnly } from "@/lib/rules/date-engine";
import { generateMemberTasks, recalculateOnRetirementDateChange } from "@/lib/tasks";
import { assertNoSsnFields, profileUpdateSchema } from "@/lib/validation";

function serializeProfile(profile: NonNullable<Awaited<ReturnType<typeof getSessionProfile>>>["profile"]) {
  if (!profile) return null;
  return {
    id: profile.id,
    fullName: profile.fullName,
    rank: profile.rank,
    branch: profile.branch,
    component: profile.component,
    installation: profile.installation,
    timezone: profile.timezone,
    projectedRetirementDate: toDateOnly(profile.projectedRetirementDate),
    officialSeparationDate: profile.officialSeparationDate ? toDateOnly(profile.officialSeparationDate) : null,
    transitionType: profile.transitionType,
    desIdesStatus: profile.desIdesStatus,
    skillbridgeStart: profile.skillbridgeStart ? toDateOnly(profile.skillbridgeStart) : null,
    skillbridgeEnd: profile.skillbridgeEnd ? toDateOnly(profile.skillbridgeEnd) : null,
    terminalLeaveStart: profile.terminalLeaveStart ? toDateOnly(profile.terminalLeaveStart) : null,
    finalDutyDay: profile.finalDutyDay ? toDateOnly(profile.finalDutyDay) : null,
    retirementLocation: profile.retirementLocation,
    overseasStatus: profile.overseasStatus,
  };
}

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    return jsonOk({ profile: serializeProfile(profile) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const body = await request.json();
    assertNoSsnFields(body);
    const data = profileUpdateSchema.parse(body);
    const existing = await prisma.memberProfile.findUnique({ where: { userId: session.userId } });
    const retirementDate = parseDateOnly(data.projectedRetirementDate);

    const payload = {
      fullName: data.fullName,
      rank: data.rank,
      branch: data.branch,
      component: data.component,
      installation: data.installation,
      timezone: data.timezone,
      projectedRetirementDate: retirementDate,
      officialSeparationDate: data.officialSeparationDate ? parseDateOnly(data.officialSeparationDate) : null,
      transitionType: data.transitionType,
      desIdesStatus: data.desIdesStatus,
      skillbridgeStart: data.skillbridgeStart ? parseDateOnly(data.skillbridgeStart) : null,
      skillbridgeEnd: data.skillbridgeEnd ? parseDateOnly(data.skillbridgeEnd) : null,
      terminalLeaveStart: data.terminalLeaveStart
        ? parseDateOnly(data.terminalLeaveStart)
        : null,
      finalDutyDay: data.finalDutyDay ? parseDateOnly(data.finalDutyDay) : null,
      retirementLocation: data.retirementLocation,
      overseasStatus: data.overseasStatus ?? false,
    };

    let profile;
    if (!existing) {
      profile = await prisma.memberProfile.create({
        data: { userId: session.userId, ...payload },
      });
      await generateMemberTasks({
        memberProfileId: profile.id,
        retirementDate,
        userId: session.userId,
        transitionType: profile.transitionType,
        desIdesStatus: profile.desIdesStatus,
        officialSeparationDate: profile.officialSeparationDate ?? retirementDate,
      });
      await writeAudit({
        userId: session.userId,
        memberProfileId: profile.id,
        entityType: "member_profile",
        entityId: profile.id,
        action: "created",
        afterValue: serializeProfile(profile),
      });
    } else {
      const previousDate = existing.projectedRetirementDate;
      profile = await prisma.memberProfile.update({
        where: { id: existing.id },
        data: payload,
      });
      if (toDateOnly(previousDate) !== toDateOnly(retirementDate)) {
        await recalculateOnRetirementDateChange({
          memberProfileId: profile.id,
          previousDate,
          nextDate: retirementDate,
          userId: session.userId,
          transitionType: profile.transitionType,
          desIdesStatus: profile.desIdesStatus,
          officialSeparationDate: profile.officialSeparationDate ?? retirementDate,
        });
      } else {
        await generateMemberTasks({
          memberProfileId: profile.id,
          retirementDate,
          userId: session.userId,
          transitionType: profile.transitionType,
          desIdesStatus: profile.desIdesStatus,
          officialSeparationDate: profile.officialSeparationDate ?? retirementDate,
        });
      }
      await writeAudit({
        userId: session.userId,
        memberProfileId: profile.id,
        entityType: "member_profile",
        entityId: profile.id,
        action: "updated",
        beforeValue: serializeProfile(existing),
        afterValue: serializeProfile(profile),
      });
    }

    return jsonOk({ profile: serializeProfile(profile) });
  } catch (error) {
    return handleRouteError(error);
  }
}
