import { handleRouteError, jsonOk, requireMemberContext } from "@/lib/api";
import { searchNominatimLocations } from "@/lib/providers/nominatim";

export async function GET(request: Request) {
  try {
    await requireMemberContext();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return jsonOk({ results: [] });
    }

    const results = await searchNominatimLocations(query);
    return jsonOk({ results });
  } catch (error) {
    return handleRouteError(error);
  }
}
