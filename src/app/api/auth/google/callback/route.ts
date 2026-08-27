import { NextResponse } from "next/server";

import { decodeJwtPayload } from "@/lib/jwt";
import { getRoleHome, setAuthCookies } from "@/lib/server-auth";
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
  return NextResponse.redirect(
    new URL(getRoleHome(payload?.role), request.url),
  );
}
