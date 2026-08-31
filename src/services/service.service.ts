import "server-only";

import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { buildQueryString } from "@/lib/buildQueryString";
import type {
  TService,
  TServiceQuery,
  CreateServicePayload,
  UpdateServicePayload,
} from "@/interface/service";

export const getServices = (query?: TServiceQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TService[]>(`/services${params}`, {
    auth: "none",
    next: {
      tags: [CACHE_TAGS.SERVICES],
      revalidate: CACHE_TIME.DAY,
    },
  });
};

export const getServiceById = (idOrSlug: string) =>
  nextServerFetch<TService>(`/services/${idOrSlug}`, {
    auth: "none",
    next: {
      tags: [CACHE_TAGS.SERVICES],
      revalidate: CACHE_TIME.DAY,
    },
  });

export const createService = (payload: CreateServicePayload) =>
  nextServerFetch<TService>("/services", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const updateService = (
  idOrSlug: string,
  payload: UpdateServicePayload,
) =>
  nextServerFetch<TService>(`/services/${idOrSlug}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

export const deleteService = (idOrSlug: string) =>
  nextServerFetch<null>(`/services/${idOrSlug}`, {
    method: "DELETE",
    auth: "auth",
  });
