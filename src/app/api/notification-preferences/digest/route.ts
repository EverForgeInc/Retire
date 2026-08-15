import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { assertNoSsnFields, digestPreferencesSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { session } = await requireMemberContext();
    const prefs = await prisma.digestPreference.findUnique({ where: { userId: session.userId } });
    return jsonOk({ preferences: prefs });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { session } = await requireMemberContext();
    const body = await request.json();
    assertNoSsnFields(body);
    const data = digestPreferencesSchema.parse(body);

    const preferences = await prisma.digestPreference.upsert({
      where: { userId: session.userId },
      update: {
        cadence: data.cadence,
        deliveryLocalTime: data.deliveryLocalTime,
        weeklyDay: data.weeklyDay ?? null,
        timezone: data.timezone,
        includeActivePhase: data.includeActivePhase ?? true,
        includeOverdue: data.includeOverdue ?? true,
        includeWaiting: data.includeWaiting ?? false,
        upcomingDays: data.upcomingDays ?? 7,
        sendEmptyDigest: data.sendEmptyDigest ?? false,
        pausedUntil: data.pausedUntil ? new Date(data.pausedUntil) : null,
      },
      create: {
        userId: session.userId,
        cadence: data.cadence,
        deliveryLocalTime: data.deliveryLocalTime,
        weeklyDay: data.weeklyDay ?? null,
        timezone: data.timezone,
        includeActivePhase: data.includeActivePhase ?? true,
        includeOverdue: data.includeOverdue ?? true,
        includeWaiting: data.includeWaiting ?? false,
        upcomingDays: data.upcomingDays ?? 7,
        sendEmptyDigest: data.sendEmptyDigest ?? false,
      },
    });

    return jsonOk({ preferences });
  } catch (error) {
    return handleRouteError(error);
  }
}
