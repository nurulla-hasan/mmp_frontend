/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { jwtDecode } from "jwt-decode";
import { revalidateTag, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";

type CookieMapping = {
  /** dot-notation path in JSON response body, e.g. "data.accessToken" */
  responsePath: string;
  /** cookie name to store the value under, e.g. "accessToken" */
  cookieName: string;
};

type NextServerFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  isPublic?: boolean;
  /**
   * Persist cookies from JSON response body.
   * e.g. [{ responsePath: "data.accessToken", cookieName: "accessToken" }]
   */
  setCookies?: CookieMapping[];
  /**
   * Persist cookies from Set-Cookie response header (for APIs that send tokens in headers).
   * Only saves "accessToken" and "refreshToken" named cookies.
   */
  persistCookies?: boolean;
  revalidate?: number | false;
  tags?: string[];
  /**
   * "updateTag": immediate expiration, best for Server Actions.
   * "revalidateTag": stale-while-revalidate, best for background updates.
   */
  invalidateMode?: "updateTag" | "revalidateTag";
  updateTag?: string | string[];
  next?: NextFetchRequestConfig;
  responseType?: "json" | "text";
  suppressErrorLogging?: boolean;
};

export type ApiError = Error & {
  status: number;
  data: unknown;
};

type ErrorSource = {
  path?: string;
  message?: string;
};

const createApiError = (
  message: string,
  status: number,
  data: unknown
): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
};

const buildApiErrorMessage = (errorData: any, fallbackStatus: number): string => {
  const baseMessage =
    typeof errorData?.message === "string" && errorData.message.trim()
      ? errorData.message.trim()
      : `HTTP ${fallbackStatus}`;

  const sources = Array.isArray(errorData?.errorSources)
    ? (errorData.errorSources as ErrorSource[])
    : [];

  const details = sources
    .map((source) => {
      const sourceMessage = source?.message?.trim();
      const sourcePath = source?.path?.trim();

      if (!sourceMessage) return null;
      if (sourceMessage === baseMessage) return null;

      return sourcePath ? `${sourcePath} - ${sourceMessage}` : sourceMessage;
    })
    .filter((value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index);

  return details.length > 0 ? `${baseMessage}: ${details.join(", ")}` : baseMessage;
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const _getValidAccessTokenImpl = async (baseUrl: string): Promise<string | null> => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return null;
  }

  const rememberMe = cookieStore.get("rememberMe")?.value === "true";

  const res = await fetch(`${baseUrl}/auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken, rememberMe }),
  });

  if (!res.ok) {
    return null;
  }

  const result = await res.json().catch(() => null);
  accessToken = result?.data?.accessToken;

  if (!accessToken) {
    return null;
  }

  try {
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 } : {}),
    });
  } catch {
    // Some server contexts do not allow writing cookies.
  }

  return accessToken;
};

/**
 * Cached version of getValidAccessToken - memoized per request.
 * Ensures cookies() and token refresh logic runs only ONCE per render.
 */
const getValidAccessToken = cache(_getValidAccessTokenImpl);

export const nextServerFetch = async <T = any>(
  endpoint: string,
  options: NextServerFetchOptions = {}
): Promise<T> => {
  const {
    isPublic = false,
    body: rawBody,
    headers,
    method = "GET",
    revalidate = method.toUpperCase() === "GET" ? 3600 : 0,
    updateTag: tagsToInvalidate,
    invalidateMode = "updateTag",
    tags,
    next,
    setCookies,
    persistCookies = false,
    responseType = "json",
    suppressErrorLogging = false,
    ...rest
  } = options;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_API;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_API is not defined");

  const defaultHeaders: Record<string, string> = {};

  const accessToken = await getValidAccessToken(baseUrl);

  if (accessToken) {
    defaultHeaders.Authorization = `Bearer ${accessToken}`;
  } else if (!isPublic) {
    throw createApiError("Authorization token is required", 401, {
      success: false,
      message: "Authorization token is required",
      statusCode: 401,
      data: null,
    });
  }

  let body = rawBody;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
    defaultHeaders["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...rest,
      method,
      ...(body ? { body: body as BodyInit } : {}),
      headers: { ...defaultHeaders, ...headers },
      next: {
        revalidate,
        tags,
        ...next,
      },
    });

    if (res.ok && tagsToInvalidate) {
      const tagList = Array.isArray(tagsToInvalidate)
        ? tagsToInvalidate
        : [tagsToInvalidate];

      tagList.forEach((tag) => {
        try {
          if (invalidateMode === "updateTag") {
            updateTag(tag);
          } else {
            revalidateTag(tag, "max");
          }
        } catch {
          revalidateTag(tag, "max");
        }
      });
    }

    // Persist tokens from Set-Cookie header (for APIs that send tokens in headers)
    const setCookieHeader = res.headers.get("set-cookie");
    if (persistCookies && setCookieHeader) {
      const cookieStore = await cookies();
      const cookiesArray = setCookieHeader.split(/,(?=[^;]+=[^;]+)/);
      cookiesArray.forEach((cookieString) => {
        if (!cookieString.includes("=")) return;
        const parts = cookieString.split(";")[0].split("=");
        const name = parts[0].trim();
        const value = parts.slice(1).join("=");
        if (name === "accessToken" || name === "refreshToken") {
          try {
            cookieStore.set(name, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
          } catch {
            // Some server contexts do not allow writing cookies.
          }
        }
      });
    }
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      const errorMessage = buildApiErrorMessage(errorData, res.status);
      if (!suppressErrorLogging) {
        console.error(`API Error (${res.status}):`, JSON.stringify(errorData, null, 2));
      }
      throw createApiError(errorMessage, res.status, errorData);
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return null as T;
    }

    const responseText = await res.text();
    let jsonResult: any = null;
    try {
      jsonResult = JSON.parse(responseText);
    } catch {
      // response is not valid JSON, skip
    }

    // Persist specific fields from the response body into cookies
    if (setCookies && setCookies.length > 0 && jsonResult) {
      const cookieStore = await cookies();
      for (const { responsePath, cookieName } of setCookies) {
        // Resolve dot-notation path, e.g. "data.accessToken"
        const value = responsePath
          .split(".")
          .reduce((obj: any, key: string) => obj?.[key], jsonResult);

        if (typeof value === "string" && value) {
          try {
            cookieStore.set(cookieName, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
          } catch {
            // Some server contexts do not allow writing cookies.
          }
        }
      }
    }

    return responseType === "text"
      ? (responseText as unknown as T)
      : (jsonResult as T);
  } catch (error: unknown) {
    const apiError = error as ApiError;
    if (apiError?.status !== 401 && !suppressErrorLogging) {
      console.error("[nextServerFetch] Error:", apiError);
    }
    throw error;
  }
};
