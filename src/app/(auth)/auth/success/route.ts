import { NextRequest, NextResponse } from "next/server";
import { decodeJwtPayload } from "@/lib/jwt";
import { setAuthCookies } from "@/services/auth.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "mouzamappro.com";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const origin = `${proto}://${host}`;

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", origin),
    );
  }

  const user = decodeJwtPayload(accessToken);
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", origin),
    );
  }

  await setAuthCookies({ accessToken, refreshToken });

  const destination =
    user.role === "ADMIN" || user.role === "SUPER_ADMIN"
      ? "/admin/dashboard"
      : "/";

  return NextResponse.redirect(new URL(destination, origin));
}
