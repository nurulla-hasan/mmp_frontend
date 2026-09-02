import "server-only";

import { cookies } from "next/headers";

import type {
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  TAuthUser,
  VerifyEmailPayload,
} from "@/interface/auth";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  domain: isProduction ? ".mouzamappro.com" : undefined,
  path: "/",
};

export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", tokens.accessToken, {
    ...authCookieOptions,
    maxAge: 15 * 60,
  });
  cookieStore.set("refreshToken", tokens.refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", "", {
    ...authCookieOptions,
    maxAge: 0,
  });
  cookieStore.set("refreshToken", "", {
    ...authCookieOptions,
    maxAge: 0,
  });
}

export const login = (payload: LoginPayload) =>
  nextServerFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const register = (payload: RegisterPayload) =>
  nextServerFetch<{ email: string }>("/auth/register", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const verifyEmail = (payload: VerifyEmailPayload) =>
  nextServerFetch<AuthTokens>("/auth/verify-email", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const resendOtp = (payload: ResendOtpPayload) =>
  nextServerFetch<null>("/auth/resend-otp", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const forgotPassword = (payload: { email: string }) =>
  nextServerFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const resendResetOtp = (payload: { email: string }) =>
  nextServerFetch<{ message: string }>("/auth/resend-reset-otp", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const resetPassword = (payload: unknown) =>
  nextServerFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: payload,
    auth: "none",
  });

export const logout = () =>
  nextServerFetch<null>("/auth/logout", {
    method: "POST",
    auth: "none",
  });

export const getMe = () =>
  nextServerFetch<{ user: TAuthUser }>("/auth/me", {
    auth: "auth",
    next: { tags: [CACHE_TAGS.ME], revalidate: CACHE_TIME.DAY },
  });

export const updateMe = (payload: unknown) =>
  nextServerFetch<{ user: TAuthUser }>("/auth/me", {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

export const changePassword = (payload: unknown) =>
  nextServerFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: payload,
    auth: "auth",
  });
