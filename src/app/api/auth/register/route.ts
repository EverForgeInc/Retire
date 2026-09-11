import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { registerWithCredentials } from "@/lib/auth";
import { isClosedBetaRegistrationEnabled, validateBetaAccessCode } from "@/lib/runtime-config";
import { assertNoSsnFields, registrationSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    if (!isClosedBetaRegistrationEnabled()) {
      return jsonError("Beta registration is not configured", 503);
    }

    const body = await request.json();
    assertNoSsnFields(body);
    const data = registrationSchema.parse(body);

    if (!validateBetaAccessCode(data.accessCode)) {
      return jsonError("Invalid beta access code", 403);
    }

    const session = await registerWithCredentials(data.email, data.password, data.displayName);
    if (!session) return jsonError("Unable to create account with that email", 409);

    return jsonOk({ user: session, next: "/onboarding" }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
