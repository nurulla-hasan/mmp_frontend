import "server-only";

import type {
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  TAuthUser,
  VerifyEmailPayload,
} from "@/interface/auth";
import { nextServerFetch } from "@/lib/nextServerFetch";
import type { AuthTokens } from "@/lib/server-auth";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

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
    method: "GET",
    auth: "auth",
     next: { tags: [CACHE_TAGS.user], revalidate: CACHE_TIME.day },
  });
