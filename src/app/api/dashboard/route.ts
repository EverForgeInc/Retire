import { buildDashboard } from "@/lib/dashboard";
import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";

export async function GET() {
  try {
    const { profile } = await requireMemberContext();
    const dashboard = await buildDashboard(profile.id);
    return jsonOk(dashboard);
  } catch (error) {
    return handleRouteError(error);
  }
}
