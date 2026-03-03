import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenNullable } from "@/lib/auth/token";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  const { pathname } = req.nextUrl;

  // 1. Define Public Routes
  const isPublicRoute = 
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/pending-approval" ||
    pathname === "/"; 

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 2. Check for Session (Access Token OR Refresh Token)
  if (!token && !refreshToken) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Verify Access Token
  let payload = null;
  if (token) {
    payload = await verifyTokenNullable(token);
  }

  // 4. Handle Expired/Invalid Access Token
  if (!payload) {
    if (refreshToken) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-Based Access Control (RBAC)
  const role = payload.role as string;
  const status = payload.status as string;

  // Handle PENDING_APPROVAL
  if (status === "PENDING_APPROVAL") {
    // If accessing API, return 403
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Account pending approval" }, { status: 403 });
    }
    // For pages, redirect to pending-approval page
    if (pathname !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return NextResponse.next();
  }

  if (status !== "ACTIVE") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "AccountSuspended");
    return NextResponse.redirect(loginUrl);
  }

  // Admin Routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "ADMIN") {
      return handleUnauthorized(req);
    }
  }

  // Doctor Routes
  if (pathname.startsWith("/doctor") || pathname.startsWith("/api/doctor")) {
    if (role !== "DOCTOR" && role !== "ADMIN") {
      return handleUnauthorized(req);
    }
  }

  // Patient Routes
  if (pathname.startsWith("/patient") || pathname.startsWith("/api/patient")) {
    if (role !== "PATIENT" && role !== "ADMIN" && role !== "DOCTOR") {
      return handleUnauthorized(req);
    }
  }

  return NextResponse.next();
}

function handleUnauthorized(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\..*).*)",
  ],
};
