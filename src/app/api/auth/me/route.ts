import { getSessionProfile } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { toDateOnly } from "@/lib/rules/date-engine";

export async function GET() {
  const ctx = await getSessionProfile();
  if (!ctx) return jsonError("Unauthorized", 401);
  return jsonOk({
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      displayName: ctx.user.displayName,
      role: ctx.user.role,
    },
    profile: ctx.profile
      ? {
          id: ctx.profile.id,
          fullName: ctx.profile.fullName,
          rank: ctx.profile.rank,
          branch: ctx.profile.branch,
          component: ctx.profile.component,
          installation: ctx.profile.installation,
          timezone: ctx.profile.timezone,
          projectedRetirementDate: toDateOnly(ctx.profile.projectedRetirementDate),
          skillbridgeStart: ctx.profile.skillbridgeStart
            ? toDateOnly(ctx.profile.skillbridgeStart)
            : null,
          skillbridgeEnd: ctx.profile.skillbridgeEnd
            ? toDateOnly(ctx.profile.skillbridgeEnd)
            : null,
          terminalLeaveStart: ctx.profile.terminalLeaveStart
            ? toDateOnly(ctx.profile.terminalLeaveStart)
            : null,
          finalDutyDay: ctx.profile.finalDutyDay
            ? toDateOnly(ctx.profile.finalDutyDay)
            : null,
          retirementLocation: ctx.profile.retirementLocation,
          overseasStatus: ctx.profile.overseasStatus,
        }
      : null,
  });
}
