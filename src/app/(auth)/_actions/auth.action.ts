"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { login, logout, register, resendOtp, verifyEmail, exchangeGoogleCode } from "@/services/auth.service";
import { decodeJwtPayload } from "@/lib/jwt";
import { CACHE_TAGS } from "@/lib/cache-tags";

type AuthResult =
  | { success: true }
  | { success: false; message?: string; errors?: Record<string, string[]> };

async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

function redirectByRole(role: string): never {
  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "SURVEYOR") redirect("/surveyor/dashboard");
  redirect("/"); // USER
}

export async function loginAction(
  data: { email: string; password: string },
  callbackUrl?: string
): Promise<AuthResult> {
  const result = await login(data);

  if (!result.success) return result;

  await setAccessTokenCookie(result.data.accessToken);
  if (result.data.refreshToken) {
    await setRefreshTokenCookie(result.data.refreshToken);
  }

  updateTag(CACHE_TAGS.user);

  const payload = decodeJwtPayload(result.data.accessToken);
  
  if (callbackUrl && callbackUrl.startsWith("/")) {
    redirect(callbackUrl);
  } else {
    redirectByRole(payload?.role ?? "USER");
  }
}

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  role: "USER" | "SURVEYOR";
}): Promise<AuthResult> {
  const result = await register(data);

  if (!result.success) return result;

  await setAccessTokenCookie(result.data.accessToken);
  if (result.data.refreshToken) {
    await setRefreshTokenCookie(result.data.refreshToken);
  }

  updateTag(CACHE_TAGS.user);

  redirectByRole(data.role);
}

export async function verifyEmailAction(data: {
  email: string;
  otp: string;
}): Promise<AuthResult> {
  const result = await verifyEmail(data);

  if (!result.success) return result;

  await setAccessTokenCookie(result.data.accessToken);
  if (result.data.refreshToken) {
    await setRefreshTokenCookie(result.data.refreshToken);
  }

  updateTag(CACHE_TAGS.user);

  const payload = decodeJwtPayload(result.data.accessToken);
  redirectByRole(payload?.role ?? "USER");
}

export async function resendOtpAction(data: {
  email: string;
}): Promise<AuthResult> {
  const result = await resendOtp(data);
  if (!result.success) return result;
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await logout();
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  updateTag(CACHE_TAGS.user);
  redirect("/login");
}

export async function exchangeGoogleCodeAction(code: string): Promise<AuthResult> {
  const result = await exchangeGoogleCode(code);

  if (!result.success) return result;

  await setAccessTokenCookie(result.data.accessToken);
  if (result.data.refreshToken) {
    await setRefreshTokenCookie(result.data.refreshToken);
  }

  updateTag(CACHE_TAGS.user);

  const payload = decodeJwtPayload(result.data.accessToken);
  redirectByRole(payload?.role ?? "USER");
}
