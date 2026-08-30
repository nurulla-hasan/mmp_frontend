"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { decodeJwtPayload } from "@/lib/jwt";
import { clearAuthCookies, setAuthCookies } from "@/services/auth.service";
import {
  login,
  logout,
  register,
  resendOtp,
  verifyEmail,
} from "@/services/auth.service";

type AuthResult =
  | { success: true }
  | { success: false; message?: string; errors?: Record<string, string[]> };

export async function loginAction(
  data: { email: string; password: string },
  callbackUrl?: string,
): Promise<AuthResult> {
  const result = await login(data);
  if (!result.success) return result;

  await setAuthCookies(result.data);
  updateTag(CACHE_TAGS.ME);

  const payload = decodeJwtPayload(result.data.accessToken);
  const homePath = payload?.role === "ADMIN" ? "/admin/dashboard" : "/";
  redirect(callbackUrl ?? homePath);
}

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const result = await register(data);
  return result.success ? { success: true } : result;
}

export async function verifyEmailAction(data: {
  email: string;
  otp: string;
}): Promise<AuthResult> {
  const result = await verifyEmail(data);
  if (!result.success) return result;

  await setAuthCookies(result.data);
  updateTag(CACHE_TAGS.ME);

  const payload = decodeJwtPayload(result.data.accessToken);
  const homePath = payload?.role === "ADMIN" ? "/admin/dashboard" : "/";
  redirect(homePath);
}

export async function resendOtpAction(data: {
  email: string;
}): Promise<AuthResult> {
  const result = await resendOtp(data);
  return result.success ? { success: true } : result;
}

export async function logoutAction(): Promise<void> {
  await logout();
  await clearAuthCookies();
  updateTag(CACHE_TAGS.ME);
  redirect("/");
}
