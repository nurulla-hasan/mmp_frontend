import "server-only";

import type {
  TReview,
  TReviewQuery,
  CreateReviewPayload,
} from "@/interface/review";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

// 1. Get all reviews for Admin
export const getAllReviews = (query?: TReviewQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TReview[]>(`/reviews${params}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.REVIEWS, CACHE_TAGS.SURVEYORS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });
};

// 2. Update review status (APPROVE / REJECT)
export const updateReviewStatus = (
  id: string,
  status: "APPROVED" | "REJECTED",
) =>
  nextServerFetch<TReview>(`/reviews/${id}/status`, {
    method: "PATCH",
    body: { status },
    auth: "auth",
  });

// 3. Delete review
export const deleteReview = (id: string) =>
  nextServerFetch<null>(`/reviews/${id}`, {
    method: "DELETE",
    auth: "auth",
  });

// 4. Create review (Authenticated User)
export const createReview = (payload: CreateReviewPayload) =>
  nextServerFetch<TReview>("/reviews", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

