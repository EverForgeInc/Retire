import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createSessionToken as createSignedSessionToken, verifySessionToken } from "@/lib/session-token";

const COOKIE_NAME = "milretire_session";
const SESSION_DAYS = 14;

export type SessionUser = {
  userId: string;
  email: string;
  displayName: string | null;
  role: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters in production");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSessionToken(user: SessionUser) {
  return createSignedSessionToken(
    {
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    new TextDecoder().decode(getSecret()),
    SESSION_DAYS,
  );
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifySessionToken(token, new TextDecoder().decode(getSecret()));
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      userId: payload.sub,
      email: payload.email,
      displayName: typeof payload.displayName === "string" ? payload.displayName : null,
      role: typeof payload.role === "string" ? payload.role : "member",
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

export async function getSessionProfile() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });
  if (!user) return null;
  return { session, user, profile: user.profile };
}

async function establishSession(user: { id: string; email: string; displayName: string | null; role: string }) {
  const sessionUser: SessionUser = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
  const token = await createSessionToken(sessionUser);
  await setSessionCookie(token);
  return sessionUser;
}

export async function registerWithCredentials(email: string, password: string, displayName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return null;

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      displayName: displayName.trim(),
      passwordHash: await hashPassword(password),
      role: "member",
    },
  });
  return establishSession(user);
}

export async function loginWithCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return establishSession(user);
}
