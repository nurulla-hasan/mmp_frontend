import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type UserRole = "USER" | "SURVEYOR" | "ADMIN";

interface TokenPayload {
  exp?: number;
  role?: unknown;
}

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/fraud-awareness",
  "/pricing",
  "/surveyors",
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
];

// Turn this on when the auth flow is ready to test
const IS_PROTECTION_ON = false;

const ROLE_HOME: Record<UserRole, string> = {
  USER: "/dashboard",
  SURVEYOR: "/surveyor/dashboard",
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

  if (!payload?.exp) return true;

  return Date.now() / 1000 >= payload.exp;
};

const getRole = (token: string): UserRole | null => {
  const payload = decodeToken(token);
  const role = payload?.role;

  return role === "USER" || role === "SURVEYOR" || role === "ADMIN"
    ? role
    : null;
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (!IS_PROTECTION_ON) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const accessToken = request.cookies.get("accessToken")?.value;

  // Redirect authenticated users away from auth pages (login, register, etc.)
  if (isAuthRoute && accessToken && !isExpired(accessToken)) {
    const role = getRole(accessToken);

    if (role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
  }

  // Redirect unauthenticated users to login for protected pages
  if (!isPublic && !isAuthRoute) {
    if (!accessToken || isExpired(accessToken)) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }

    const role = getRole(accessToken);

    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based access control
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
  ],
};
