import "server-only";

import type {
  CreateCalculationPayload,
  TCalculation,
  TUserMeasurementStat,
  UpdateCalculationPayload,
} from "@/interface/calculation";
import type { TQuery } from "@/interface/global";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

export const getCalculations = (query?: TQuery) =>
  nextServerFetch<TCalculation[]>(
    `/calculations${query ? buildQueryString(query) : ""}`,
    {
      auth: "auth",
      next: {
        tags: [CACHE_TAGS.calculations],
        revalidate: CACHE_TIME.fiveMinutes,
      },
    },
  );

export const getCalculationById = (id: string) =>
  nextServerFetch<TCalculation>(`/calculations/${id}`, {
    auth: "auth",
  });

export const saveCalculation = (payload: CreateCalculationPayload) =>
  nextServerFetch<TCalculation>("/calculations", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const updateCalculation = (
  id: string,
  payload: UpdateCalculationPayload,
) =>
  nextServerFetch<TCalculation>(`/calculations/${id}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

export const deleteCalculation = (id: string) =>
  nextServerFetch<null>(`/calculations/${id}`, {
    method: "DELETE",
    auth: "auth",
  });

export const getMyMeasurementStats = () =>
  nextServerFetch<TUserMeasurementStat>("/calculations/stats/me", {
    auth: "auth",
    next: { tags: [CACHE_TAGS.user], revalidate: CACHE_TIME.fiveMinutes },
  });
