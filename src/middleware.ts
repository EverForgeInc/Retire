import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/docs") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const token = request.cookies.get("milretire_session")?.value;
  const secret = process.env.AUTH_SECRET;

  if (isPublic) {
    if (token && secret && pathname === "/login") {
      try {
        await jwtVerify(token, new TextEncoder().encode(secret));
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  if (!token || !secret) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
