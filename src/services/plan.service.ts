import "server-only";

import type {
  TPlan,
  TPlanQuery,
  CreatePlanPayload,
  UpdatePlanPayload,
} from "@/interface/plan";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

// 1. Get all subscription plans
export const getAllPlans = (query?: TPlanQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TPlan[]>(`/plans${params}`, {
    auth: "none",
    next: {
      tags: [CACHE_TAGS.PLANS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });
};

// 2. Get single plan by ID
export const getPlanById = (id: string) =>
  nextServerFetch<TPlan>(`/plans/${id}`, {
    auth: "none",
    next: {
      tags: [CACHE_TAGS.PLANS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });

// 3. Create plan (Admin)
export const createPlan = (payload: CreatePlanPayload) =>
  nextServerFetch<TPlan>("/plans", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

// 4. Update plan (Admin)
export const updatePlan = (id: string, payload: UpdatePlanPayload) =>
  nextServerFetch<TPlan>(`/plans/${id}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

// 5. Toggle plan active status (Admin)
export const togglePlanStatus = (id: string) =>
  nextServerFetch<TPlan>(`/plans/${id}/status`, {
    method: "PATCH",
    auth: "auth",
  });

// 6. Delete plan (Admin)
export const deletePlan = (id: string) =>
  nextServerFetch<null>(`/plans/${id}`, {
    method: "DELETE",
    auth: "auth",
  });

