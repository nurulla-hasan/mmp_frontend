import "server-only";

import type {
  TBroadcast,
  TBroadcastQuery,
  CreateBroadcastPayload,
  UpdateBroadcastPayload,
} from "@/interface/broadcast";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

// 1. Get all broadcasts for Admin
export const getAllBroadcasts = (query?: TBroadcastQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TBroadcast[]>(`/broadcasts${params}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.BROADCASTS],
      revalidate: CACHE_TIME.DAY,
    },
  });
};

// 2. Get active broadcasts (Public / Users)
export const getActiveBroadcasts = () =>
  nextServerFetch<TBroadcast[]>("/broadcasts/active", {
    auth: "none",
    next: {
      tags: [CACHE_TAGS.BROADCASTS],
      revalidate: CACHE_TIME.DAY,
    },
  });

// 3. Get single broadcast by ID
export const getBroadcastById = (id: string) =>
  nextServerFetch<TBroadcast>(`/broadcasts/${id}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.BROADCASTS],
      revalidate: CACHE_TIME.DAY,
    },
  });

// 4. Create broadcast (Admin)
export const createBroadcast = (payload: CreateBroadcastPayload) =>
  nextServerFetch<TBroadcast>("/broadcasts", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

// 5. Update broadcast (Admin)
export const updateBroadcast = (id: string, payload: UpdateBroadcastPayload) =>
  nextServerFetch<TBroadcast>(`/broadcasts/${id}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

// 6. Toggle broadcast status (Admin)
export const toggleBroadcastStatus = (id: string) =>
  nextServerFetch<TBroadcast>(`/broadcasts/${id}/status`, {
    method: "PATCH",
    auth: "auth",
  });

// 7. Delete broadcast (Admin)
export const deleteBroadcast = (id: string) =>
  nextServerFetch<null>(`/broadcasts/${id}`, {
    method: "DELETE",
    auth: "auth",
  });
