import "server-only";

import { cookies } from "next/headers";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });
  cookieStore.set("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export function getRoleHome(role?: string): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "SURVEYOR") return "/surveyor/dashboard";
  return "/dashboard";
}
