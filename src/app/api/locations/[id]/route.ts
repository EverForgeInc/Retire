import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { savedLocationSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    const { profile, session } = await requireMemberContext();
    const { id } = await params;
    const existing = await prisma.savedLocation.findFirst({ where: { id, memberProfileId: profile.id } });
    if (!existing) return new Response(JSON.stringify({ error: "Location not found" }), { status: 404 });
    const data = savedLocationSchema.parse(await request.json());
    if (data.isPreferred) await prisma.savedLocation.updateMany({ where: { memberProfileId: profile.id }, data: { isPreferred: false } });
    const updated = await prisma.savedLocation.update({ where: { id }, data: { ...data, manualCosts: data.manualCosts ? JSON.stringify(data.manualCosts) : undefined, isPreferred: data.isPreferred ?? existing.isPreferred } });
    await writeAudit({ userId: session.userId, memberProfileId: profile.id, entityType: "saved_location", entityId: id, action: "updated", afterValue: { id, city: updated.city, country: updated.country } });
    return jsonOk({ location: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { profile, session } = await requireMemberContext();
    const { id } = await params;
    const existing = await prisma.savedLocation.findFirst({ where: { id, memberProfileId: profile.id } });
    if (!existing) return new Response(JSON.stringify({ error: "Location not found" }), { status: 404 });
    await prisma.savedLocation.delete({ where: { id } });
    await writeAudit({ userId: session.userId, memberProfileId: profile.id, entityType: "saved_location", entityId: id, action: "deleted", afterValue: { id } });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}