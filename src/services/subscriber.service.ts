import "server-only";

import type {
  TSubscriber,
  TSubscriberQuery,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from "@/interface/subscriber";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

// 1. Get all subscribers for Admin
export const getAllSubscribers = (query?: TSubscriberQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TSubscriber[]>(`/subscribers${params}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.SUBSCRIBERS, CACHE_TAGS.USERS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });
};

// 2. Get single subscriber by ID
export const getSubscriberById = (id: string) =>
  nextServerFetch<TSubscriber>(`/subscribers/${id}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.SUBSCRIBERS, CACHE_TAGS.USERS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });

// 3. Create subscription manually (Admin)
export const createSubscription = (payload: CreateSubscriptionPayload) =>
  nextServerFetch<TSubscriber>("/subscribers", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

// 4. Update subscription (Admin)
export const updateSubscription = (
  id: string,
  payload: UpdateSubscriptionPayload,
) =>
  nextServerFetch<TSubscriber>(`/subscribers/${id}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

// 5. Extend subscription by X days
export const extendSubscription = (id: string, days: number) =>
  nextServerFetch<TSubscriber>(`/subscribers/${id}/extend`, {
    method: "PATCH",
    body: { days },
    auth: "auth",
  });

// 6. Revoke subscription
export const revokeSubscription = (id: string) =>
  nextServerFetch<TSubscriber>(`/subscribers/${id}/revoke`, {
    method: "PATCH",
    auth: "auth",
  });

