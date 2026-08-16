import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { loginWithCredentials } from "@/lib/auth";
import { assertNoSsnFields, loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    assertNoSsnFields(body);
    const data = loginSchema.parse(body);
    const session = await loginWithCredentials(data.email, data.password);
    if (!session) return jsonError("Invalid email or password", 401);
    return jsonOk({ user: session });
  } catch (error) {
    return handleRouteError(error);
  }
}
