import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type UserRole = "USER" | "SURVEYOR" | "ADMIN";
type TokenPayload = { exp?: number; role?: unknown };
type RefreshResult = {
  data?: { accessToken?: string; refreshToken?: string };
};

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/fraud-awareness",
  "/pricing",
  "/surveyors",
  "/join-as-surveyor",
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
];

const ROLE_HOME: Record<UserRole, string> = {
  USER: "/dashboard",
  SURVEYOR: "/surveyor/profile",
  ADMIN: "/admin/dashboard",
};

const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};

const isExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  return !payload?.exp || Date.now() / 1000 >= payload.exp;
};

const getRole = (token: string): UserRole | null => {
  const role = decodeToken(token)?.role;
  return role === "USER" || role === "SURVEYOR" || role === "ADMIN" ? role : null;
};

const matches = (pathname: string, routes: string[]): boolean =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const setTokenCookies = (
  response: NextResponse,
  tokens: { accessToken?: string; refreshToken?: string },
): NextResponse => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  if (tokens.accessToken) {
    response.cookies.set("accessToken", tokens.accessToken, {
      ...options,
      maxAge: 15 * 60,
    });
  }
  if (tokens.refreshToken) {
    response.cookies.set("refreshToken", tokens.refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60,
    });
  }
  return response;
};

const refreshTokens = async (
  refreshToken: string,
): Promise<RefreshResult["data"] | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const result = (await response.json()) as RefreshResult;
    return result.data ?? null;
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const isPublic = matches(pathname, PUBLIC_ROUTES);
  const isAuthRoute = matches(pathname, AUTH_ROUTES);
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let refreshed: RefreshResult["data"] | null = null;

  // ── Refresh Access Token if Expired ─────────────────────────────
  if ((!accessToken || isExpired(accessToken)) && refreshToken) {
    refreshed = await refreshTokens(refreshToken);
    accessToken = refreshed?.accessToken;
  }

  const role =
    accessToken && !isExpired(accessToken) ? getRole(accessToken) : null;

  // ── 1. ADMIN Rule: Admin can ONLY access /admin/* routes ─────────
  if (role === "ADMIN" && !pathname.startsWith("/admin")) {
    return setTokenCookies(
      NextResponse.redirect(new URL("/admin/dashboard", request.url)),
      refreshed ?? {},
    );
  }

  // ── 2. Stealth Mode: Surveyor gets 404 Not Found on /join-as-surveyor
  if (role === "SURVEYOR" && pathname.startsWith("/join-as-surveyor")) {
    return setTokenCookies(
      NextResponse.redirect(new URL("/not-found", request.url)),
      refreshed ?? {},
    );
  }

  // ── 3. Auth Routes (/login, /register, etc.) for Logged-in Users ─
  if (isAuthRoute && role) {
    return setTokenCookies(
      NextResponse.redirect(new URL(ROLE_HOME[role], request.url)),
      refreshed ?? {},
    );
  }

  // ── 4. Protected Private Routes Guard (Direct 404 if unauthorized)
  if (!isPublic && !isAuthRoute) {
    if (!accessToken || isExpired(accessToken) || !role) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/dashboard") && role !== "USER") {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
    if (pathname.startsWith("/surveyor") && role !== "SURVEYOR") {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
  }

  return setTokenCookies(NextResponse.next(), refreshed ?? {});
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
  ],
};
