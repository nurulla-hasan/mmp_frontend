import "server-only";

import type {
  TVerificationRequest,
  TVerificationQuery,
  VerifySurveyorPayload,
} from "@/interface/verification";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

// 1. Get all surveyor verification requests for Admin
export const getVerificationRequests = (query?: TVerificationQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TVerificationRequest[]>(
    `/surveyor/verifications${params}`,
    {
      auth: "auth",
      next: {
        tags: [CACHE_TAGS.SURVEYORS, CACHE_TAGS.USERS],
        revalidate: CACHE_TIME.FIVE_MINUTES,
      },
    },
  );
};

// 2. Get verification request details by ID
export const getVerificationRequestById = (id: string) =>
  nextServerFetch<TVerificationRequest>(`/surveyor/verifications/${id}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.SURVEYORS, CACHE_TAGS.USERS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });

// 3. Approve or Reject surveyor verification request
export const verifySurveyor = (
  userId: string,
  payload: VerifySurveyorPayload,
) =>
  nextServerFetch<TVerificationRequest>(`/surveyor/${userId}/verify`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });
