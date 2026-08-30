import "server-only";

import { cookies } from "next/headers";

import type {
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  TAuthUser,
  VerifyEmailPayload,
} from "@/interface/auth";
import type { TSurveyorProfile, TSurveyorService } from "@/interface/surveyor-profile";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";
import type { TQuery } from "@/interface/global";

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
    next: { tags: [CACHE_TAGS.ME], revalidate: 0 },
  });

export const updateMe = (payload: unknown) =>
  nextServerFetch<{ user: TAuthUser }>("/auth/me", {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

// ── Surveyor services (public catalog: id + slug + name) ──
export const getServices = () =>
  nextServerFetch<TSurveyorService[]>("/services", {
    auth: "none",
    next: { revalidate: CACHE_TIME.DAY },
  });

// ── Districts (public catalog: value + label + upazilas) ──
export const getDistricts = () =>
  nextServerFetch<{ value: string; label: string; upazilas: string[] }[]>(
    "/districts",
    {
      auth: "none",
      next: { revalidate: CACHE_TIME.DAY },
    },
  );

// ── Surveyor profile ──
export const getAllSurveyors = (query?: TQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TSurveyorProfile[]>(`/surveyor${params}`, {
    auth: "none",
    next: { tags: [CACHE_TAGS.SURVEYORS], revalidate: CACHE_TIME.DAY },
  });
};

export const getSurveyorBySlug = (slug: string) =>
  nextServerFetch<TSurveyorProfile>(`/surveyor/${slug}`, {
    auth: "none",
    next: { tags: [CACHE_TAGS.SURVEYOR_PROFILE], revalidate: 60 },
  });

export const applyAsSurveyor = (payload: unknown) =>
  nextServerFetch<TSurveyorProfile>("/surveyor/profile", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const updateMySurveyorProfile = (payload: unknown) =>
  nextServerFetch<TSurveyorProfile>("/surveyor/profile", {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });
