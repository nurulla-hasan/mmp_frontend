import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

type AuthMode = "required" | "optional" | "none";

type NextServerFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: AuthMode;
  next?: NextFetchRequestConfig;
};

type ErrorSource = {
  path?: string | number;
  message?: string;
};

type ErrorResponse = {
  message?: string;
  errorSources?: ErrorSource[];
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getAccessToken = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();

  return cookieStore.get("accessToken")?.value ?? null;
});

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new ApiError(
      "API returned an invalid JSON response",
      response.status,
      null,
    );
  }
};

const buildErrorMessage = (
  errorData: unknown,
  status: number,
): string => {
  if (!isObject(errorData)) {
    return `Request failed with status ${status}`;
  }

  const data = errorData as ErrorResponse;

  const baseMessage =
    typeof data.message === "string" && data.message.trim()
      ? data.message.trim()
      : `Request failed with status ${status}`;

  const errorSources = Array.isArray(data.errorSources)
    ? data.errorSources
    : [];

  const details = errorSources
    .map((source) => {
      const message =
        typeof source.message === "string" ? source.message.trim() : "";

      if (!message || message === baseMessage) {
        return null;
      }

      const path =
        typeof source.path === "string" || typeof source.path === "number"
          ? String(source.path).trim()
          : "";

      return path ? `${path} - ${message}` : message;
    })
    .filter(
      (value, index, values): value is string =>
        Boolean(value) && values.indexOf(value) === index,
    );

  return details.length
    ? `${baseMessage}: ${details.join(", ")}`
    : baseMessage;
};

const prepareBody = (
  body: unknown,
  headers: Headers,
): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body;
  }

  if (typeof body === "string") {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
};

export const nextServerFetch = async <T>(
  endpoint: string,
  options: NextServerFetchOptions = {},
): Promise<T> => {
  const {
    auth = "required",
    body: rawBody,
    headers: customHeaders,
    method = "GET",
    cache: cacheOption,
    next,
    ...requestOptions
  } = options;

  const baseUrl =
    process.env.BASE_API_URL ?? process.env.NEXT_PUBLIC_BASE_API;

  if (!baseUrl) {
    throw new Error("BASE_API_URL is not defined");
  }

  const normalizedMethod = method.toUpperCase();
  const headers = new Headers(customHeaders);

  const accessToken = auth === "none" ? null : await getAccessToken();

  if (auth === "required" && !accessToken) {
    throw new ApiError("Authorization token is required", 401, {
      success: false,
      message: "Authorization token is required",
      statusCode: 401,
      data: null,
    });
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const body = prepareBody(rawBody, headers);

  /*
   * Mutations and authenticated requests should not use shared server
   * fetch caching. Public GET requests can opt into caching through
   * the `next` or `cache` options.
   */
  const shouldDisableCache =
    normalizedMethod !== "GET" || auth !== "none";

  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.replace(/^\//, "");

  const response = await fetch(
    `${normalizedBaseUrl}/${normalizedEndpoint}`,
    {
      ...requestOptions,
      method: normalizedMethod,
      headers,
      ...(body !== undefined ? { body } : {}),
      cache:
        cacheOption ?? (shouldDisableCache ? "no-store" : undefined),
      ...(next ? { next } : {}),
    },
  );

  const responseData = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(
      buildErrorMessage(responseData, response.status),
      response.status,
      responseData,
    );
  }

  return responseData as T;
};
