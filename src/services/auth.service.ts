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

export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();
  cookieStore.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
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

export const logout = () =>
  nextServerFetch<null>("/auth/logout", {
    method: "POST",
    auth: "none",
  });

export const exchangeGoogleCode = (code: string) =>
  nextServerFetch<AuthTokens>("/auth/google/exchange", {
    method: "POST",
    body: { code },
    auth: "none",
  });

export const getMe = () =>
  nextServerFetch<{ user: TAuthUser }>("/auth/me", {
    auth: "auth",
    next: { tags: [CACHE_TAGS.user], revalidate: CACHE_TIME.day },
  });
