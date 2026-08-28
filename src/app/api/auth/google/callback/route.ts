import { NextResponse } from "next/server";

import { decodeJwtPayload } from "@/lib/jwt";
import { setAuthCookies } from "@/services/auth.service";
import { exchangeGoogleCode } from "@/services/auth.service";

export async function GET(request: Request): Promise<NextResponse> {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", request.url),
    );
  }

  const result = await exchangeGoogleCode(code);
  if (!result.success) {
    return NextResponse.redirect(
      new URL("/login?error=google_auth_failed", request.url),
    );
  }

  await setAuthCookies(result.data);
  const payload = decodeJwtPayload(result.data.accessToken);
  const homePath = payload?.role === "ADMIN" ? "/admin/dashboard" : "/";
  return NextResponse.redirect(new URL(homePath, request.url));
}
