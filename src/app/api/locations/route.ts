import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { savedLocationSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const locations = await prisma.savedLocation.findMany({
      where: { memberProfileId: profile.id },
      include: { location: { include: { costVersions: { where: { approved: true } } } } },
      orderBy: [{ isPreferred: "desc" }, { city: "asc" }],
    });
    return jsonOk({ locations });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { profile, session } = await requireMemberContext();
    const data = savedLocationSchema.parse(await request.json());
    const location = await prisma.location.upsert({
      where: { id: "never-match" },
      update: {},
      create: {
        city: data.city,
        region: data.state,
        country: data.country,
        countryCode: data.countryCode,
        currency: data.currency,
      },
    });
    const isPreferred = data.isPreferred === true;
    if (isPreferred) {
      await prisma.savedLocation.updateMany({ where: { memberProfileId: profile.id }, data: { isPreferred: false } });
    }
    const saved = await prisma.savedLocation.create({
      data: {
        memberProfileId: profile.id,
        locationId: location.id,
        city: data.city,
        state: data.state,
        country: data.country,
        countryCode: data.countryCode,
        currency: data.currency,
        latitude: data.latitude,
        longitude: data.longitude,
        isPreferred,
        manualCosts: JSON.stringify(data.manualCosts ?? {}),
      },
    });
    await writeAudit({ userId: session.userId, memberProfileId: profile.id, entityType: "saved_location", entityId: saved.id, action: "created", afterValue: { id: saved.id, city: saved.city, country: saved.country } });
    return jsonOk({ location: saved }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}