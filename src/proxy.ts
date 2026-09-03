import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface TokenPayload {
  exp?: number;
  role?: string;
  isSubscribed?: boolean;
}

// ── 1. Routes derived directly from app/(private) folder ──────────────────────
const PRIVATE_ROUTES = [
  "/admin",
  "/dashboard",
  "/surveyor",
  "/tools",
  "/calculations",
  "/community",
];

// ── 2. Routes derived directly from app/(auth) folder ─────────────────────────
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
];

// ── 3. Pro-only tools requiring active subscription ───────────────────────────
const PRO_TOOL_ROUTES = [
  "/tools/land-measurement",
  "/tools/mouza-geo-studio",
  "/tools/mouza-map-studio",
  "/tools/pantagraph",
  "/tools/tracer",
];

// ── 3. Default redirect destinations by user role ─────────────────────────────
const ROLE_HOME: Record<string, string> = {
  USER: "/dashboard/profile",
  SURVEYOR: "/surveyor/profile",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};

function decodeToken(token?: string): TokenPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

// ── Explicit Token Expiry Check ───────────────────────────────────────────────
function isTokenExpired(token?: string): boolean {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() / 1000 >= payload.exp;
}

function getValidSession(token?: string): TokenPayload | null {
  if (!token || isTokenExpired(token)) return null;
  return decodeToken(token);
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://apis.mouzamappro.com/api/v1";
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.accessToken || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const isPrivateRoute = PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let newAccessToken: string | null = null;

  let session = getValidSession(accessToken);

  // ── Auto-refresh: If access token expired/missing but valid refresh token exists ───
  if (!session && refreshToken && !isTokenExpired(refreshToken)) {
    newAccessToken = await refreshAccessToken(refreshToken);
    if (newAccessToken) {
      accessToken = newAccessToken;
      session = getValidSession(newAccessToken);
    }
  }

  const isAuthenticated = Boolean(session);
  let response = NextResponse.next();

  // ── 1. Unauthenticated users trying to access private routes ────────────────
  if (isPrivateRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    response = NextResponse.redirect(loginUrl);
  }
  // ── 2. Already authenticated users trying to access auth routes ─────────────
  else if (isAuthRoute && isAuthenticated) {
    const role = session?.role || "USER";
    const redirectUrl = ROLE_HOME[role] || "/dashboard/profile";
    response = NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  // ── 3. Strict Role Isolation: Nobody can enter another role's private portal ──
  else if (isAuthenticated && session?.role) {
    const role = session.role;

    // 1. Admin Jail: ADMIN & SUPER_ADMIN can ONLY access /admin/* routes
    if (
      (role === "ADMIN" || role === "SUPER_ADMIN") &&
      !pathname.startsWith("/admin")
    ) {
      response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    // 2. Non-admin trying to access /admin — blocked
    else if (
      pathname.startsWith("/admin") &&
      role !== "ADMIN" &&
      role !== "SUPER_ADMIN"
    ) {
      response = NextResponse.redirect(new URL("/not-found", request.url));
    }
    // 3. /surveyor — ONLY SURVEYOR allowed (neither USER nor ADMIN)
    else if (pathname.startsWith("/surveyor") && role !== "SURVEYOR") {
      response = NextResponse.redirect(new URL("/not-found", request.url));
    }
    // 4. /dashboard — ONLY regular USER allowed (neither SURVEYOR nor ADMIN)
    else if (pathname.startsWith("/dashboard") && role !== "USER") {
      response = NextResponse.redirect(new URL("/not-found", request.url));
    }
    // 5. Pro-only tools guard: Non-subscribed users redirected to /pricing
    else if (
      PRO_TOOL_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      ) &&
      !session.isSubscribed
    ) {
      response = NextResponse.redirect(new URL("/pricing", request.url));
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // ── Set newly refreshed accessToken in response cookie ──────────────────────
  if (newAccessToken) {
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|assets|.*\\..*).*)",
  ],
};
