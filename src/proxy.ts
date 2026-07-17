import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type TokenPayload = {
  exp?: number;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_BUFFER_SECONDS = 30;
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60;

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = jwtDecode<TokenPayload>(token);

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const expiresAt = getTokenExpiry(token);

  if (!expiresAt) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  return expiresAt <= currentTime + REFRESH_BUFFER_SECONDS;
};

const getTokenMaxAge = (token: string): number | undefined => {
  const expiresAt = getTokenExpiry(token);

  if (!expiresAt) {
    return undefined;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const maxAge = expiresAt - currentTime;

  return maxAge > 0 ? maxAge : undefined;
};

const getAuthTokens = (responseData: unknown): AuthTokens | null => {
  if (!isObject(responseData) || !isObject(responseData.data)) {
    return null;
  }

  const { accessToken, refreshToken } = responseData.data;

  if (
    typeof accessToken !== "string" ||
    !accessToken ||
    typeof refreshToken !== "string" ||
    !refreshToken
  ) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
};

const createForwardedResponse = (request: NextRequest): NextResponse => {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("cookie", request.cookies.toString());

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
};

const clearAuthCookies = (request: NextRequest): NextResponse => {
  request.cookies.delete("accessToken");
  request.cookies.delete("refreshToken");

  const response = createForwardedResponse(request);

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken || (accessToken && !isTokenExpired(accessToken))) {
    return NextResponse.next();
  }

  const baseUrl =
    process.env.BASE_API_URL ?? process.env.NEXT_PUBLIC_BASE_API;

  if (!baseUrl) {
    return NextResponse.next();
  }

  const rememberMe = request.cookies.get("rememberMe")?.value === "true";
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  try {
    const response = await fetch(
      `${normalizedBaseUrl}/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          rememberMe,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return clearAuthCookies(request);
    }

    const responseData: unknown = await response.json();
    const tokens = getAuthTokens(responseData);

    if (!tokens) {
      return clearAuthCookies(request);
    }

    request.cookies.set("accessToken", tokens.accessToken);
    request.cookies.set("refreshToken", tokens.refreshToken);

    const nextResponse = createForwardedResponse(request);
    const accessTokenMaxAge = getTokenMaxAge(tokens.accessToken);
    const refreshTokenMaxAge = rememberMe
      ? getTokenMaxAge(tokens.refreshToken) ?? REMEMBER_ME_MAX_AGE
      : undefined;

    nextResponse.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(accessTokenMaxAge ? { maxAge: accessTokenMaxAge } : {}),
    });

    nextResponse.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(refreshTokenMaxAge ? { maxAge: refreshTokenMaxAge } : {}),
    });

    return nextResponse;
  } catch (error: unknown) {
    return clearAuthCookies(request);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)",
  ],
};
