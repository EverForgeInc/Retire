const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(normalized + padding, "base64"));
  }

  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signData(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

export type SessionTokenPayload = {
  sub: string;
  email: string;
  displayName?: string | null;
  role?: string;
  iat?: number;
  exp?: number;
};

export async function createSessionToken(
  user: { userId: string; email: string; displayName?: string | null; role?: string },
  secret: string,
  ttlDays = 14,
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.userId,
    email: user.email,
    displayName: user.displayName ?? null,
    role: user.role ?? "member",
    iat: issuedAt,
    exp: issuedAt + ttlDays * 24 * 60 * 60,
  };

  const headerSegment = toBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payloadSegment = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signData(secret, `${headerSegment}.${payloadSegment}`);

  return `${headerSegment}.${payloadSegment}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionTokenPayload> {
  const segments = token.split(".");
  if (segments.length !== 3) {
    throw new Error("Invalid session token");
  }

  const [headerSegment, payloadSegment, signature] = segments;
  const expectedSignature = await signData(secret, `${headerSegment}.${payloadSegment}`);

  if (!constantTimeEquals(signature, expectedSignature)) {
    throw new Error("Invalid session token signature");
  }

  const payloadJson = new TextDecoder().decode(fromBase64Url(payloadSegment));
  const payload = JSON.parse(payloadJson) as SessionTokenPayload;

  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid session token payload");
  }

  if (typeof payload.email !== "string") {
    throw new Error("Invalid session token payload");
  }

  if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Session token expired");
  }

  return payload;
}
