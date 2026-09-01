import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type UserRole = "USER" | "SURVEYOR" | "ADMIN" | "SUPER_ADMIN";

interface TokenPayload {
  exp?: number;
  role?: unknown;
  isSubscribed?: boolean;
}

const PUBLIC_PREFIXES = [
  "/",
  "/about",
  "/contact",
  "/fraud-awareness",
  "/pricing",
  "/surveyors",
  "/join-as-surveyor",
];

const FREE_TOOL_ROUTES = [
  "/tools/unit-converter",
  "/tools/inheritance-calculator",
  "/tools/scale-guide",
];

const PRO_ONLY_TOOL_ROUTES = [
  "/tools/land-measurement",
  "/tools/pantagraph",
  "/tools/tracer",
  "/tools/mouza-map-studio",
  "/tools/mouza-geo-studio",
];

const isPublicRoute = (pathname: string): boolean => {
  // 1. Pro tools must NEVER be public
  if (
    PRO_ONLY_TOOL_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return false;
  }

  // 2. Exact "/tools" hub page
  if (pathname === "/tools") {
    return true;
  }

  // 3. Free specific tools
  if (
    FREE_TOOL_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  ) {
    return true;
  }

  // 4. Other standard public prefixes
  return PUBLIC_PREFIXES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
};

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
];

// Set to true to enforce route protection
const IS_PROTECTION_ON = true;

const ROLE_HOME: Record<UserRole, string> = {
  USER: "/dashboard/profile",
  SURVEYOR: "/surveyor/profile",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
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

  if (!payload?.exp) return true;

  return Date.now() / 1000 >= payload.exp;
};

const getRole = (token: string): UserRole | null => {
  const payload = decodeToken(token);
  const role = payload?.role as string;

  return role === "USER" ||
    role === "SURVEYOR" ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN"
    ? (role as UserRole)
    : null;
};

const getIsSubscribed = (token: string): boolean => {
  const payload = decodeToken(token);
  return !!payload?.isSubscribed;
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!IS_PROTECTION_ON) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  const isPublic = isPublicRoute(pathname);

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  let newAccessToken: string | undefined;

  // Try to refresh token if missing or expired
  if ((!accessToken || isExpired(accessToken)) && refreshToken) {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${apiUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await res.json();

      if (data?.success && data?.data?.accessToken) {
        newAccessToken = data.data.accessToken;
        accessToken = newAccessToken;
      }
    } catch (error) {
      console.error("Token refresh failed in proxy:", error);
    }
  }

  const role =
    accessToken && !isExpired(accessToken) ? getRole(accessToken) : null;
  const isSubscribed =
    accessToken && !isExpired(accessToken)
      ? getIsSubscribed(accessToken)
      : false;

  let response: NextResponse;

  // ── 1. ADMIN & SUPER_ADMIN Rule: Admins can ONLY access /admin/* routes ─────────
  // If an Admin/Super Admin tries to access ANY other route (/tools, /calculations, /, /about, etc.),
  // they are strictly redirected to /admin/dashboard
  if (
    (role === "ADMIN" || role === "SUPER_ADMIN") &&
    !pathname.startsWith("/admin")
  ) {
    response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  // ── 2. SURVEYOR Rule: Stealth Mode on /join-as-surveyor ──────────
  else if (role === "SURVEYOR" && pathname.startsWith("/join-as-surveyor")) {
    response = NextResponse.redirect(new URL("/not-found", request.url));
  }
  // ── 3. Authenticated Users on Auth Routes (/login, /register, etc.) ──
  else if (isAuthRoute && role) {
    response = NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }
  // ── 4. Protected Private Routes Guard (/tools Pro routes, /calculations, /dashboard, /admin, etc.) ──
  else if (!isPublic && !isAuthRoute) {
    if (!accessToken || isExpired(accessToken)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        pathname + request.nextUrl.search,
      );
      response = NextResponse.redirect(loginUrl);
    } else {
      if (!role) {
        response = NextResponse.redirect(new URL("/login", request.url));
      }
      // Subscription protection for Pro-only tools: Free users trying to access Pro tools are redirected to /pricing
      else if (
        PRO_ONLY_TOOL_ROUTES.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        ) &&
        !isSubscribed
      ) {
        response = NextResponse.redirect(new URL("/pricing", request.url));
      }
      // Role-based access control
      else if (pathname.startsWith("/dashboard") && role !== "USER") {
        response = NextResponse.redirect(new URL("/not-found", request.url));
      } else if (pathname.startsWith("/surveyor") && role !== "SURVEYOR") {
        response = NextResponse.redirect(new URL("/not-found", request.url));
      } else if (
        pathname.startsWith("/admin") &&
        role !== "ADMIN" &&
        role !== "SUPER_ADMIN"
      ) {
        response = NextResponse.redirect(new URL("/not-found", request.url));
      } else {
        response = NextResponse.next();
      }
    }
  } else {
    response = NextResponse.next();
  }

  // If a new access token was fetched, set it in the response cookies
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
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
  ],
};
