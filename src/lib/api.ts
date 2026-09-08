import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionProfile } from "@/lib/auth";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export class PublicApiError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof Response) return error;
  if (error instanceof ZodError) {
    return jsonError(error.issues.map((i) => i.message).join("; "), 400);
  }
  if (error instanceof PublicApiError) {
    return jsonError(error.message, error.status);
  }
  return jsonError("Unexpected server error", 500);
}

export async function requireMemberContext() {
  const ctx = await getSessionProfile();
  if (!ctx) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!ctx.profile) {
    throw new Response(JSON.stringify({ error: "Profile not found. Complete onboarding." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  return { user: ctx.user, profile: ctx.profile, session: ctx.session };
}
