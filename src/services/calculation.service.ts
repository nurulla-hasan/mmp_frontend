import "server-only";

import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { buildQueryString } from "@/lib/buildQueryString";
import type {
  TCalculation,
  CreateCalculationPayload,
  TUserMeasurementStat,
} from "@/interface/calculation";
import type { TQuery } from "@/interface/global";

export const saveCalculation = (payload: CreateCalculationPayload) =>
  nextServerFetch<TCalculation>("/calculations", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const incrementPlotCount = () =>
  nextServerFetch<TUserMeasurementStat>("/calculations/stats/increment-plot", {
    method: "POST",
    auth: "auth",
  });

export const getCalculations = (query?: TQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TCalculation[]>(`/calculations${params}`, {
    auth: "auth",
    next: {
      tags: [CACHE_TAGS.CALCULATIONS],
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });
};

export const getCalculationById = (id: string) =>
  nextServerFetch<TCalculation>(`/calculations/${id}`, {
    auth: "auth",
    next: { revalidate: 60 },
  });

export const updateCalculation = (
  id: string,
  payload: Partial<CreateCalculationPayload>,
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
    next: { tags: [CACHE_TAGS.ME], revalidate: CACHE_TIME.FIVE_MINUTES },
  });
