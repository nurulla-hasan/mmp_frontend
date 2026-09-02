import "server-only";

import type { TSurveyorProfile } from "@/interface/surveyor-profile";
import type { TQuery } from "@/interface/global";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDistricts } from "./district.service";

// ── Surveyor profiles ──
export const getAllSurveyors = async (query?: TQuery) => {
  let mappedQuery = query;
  if (query?.district) {
    try {
      const districtsRes = await getDistricts();
      if (districtsRes.success && districtsRes.data) {
        const found = districtsRes.data.find(
          (d) =>
            d.value.toLowerCase() === String(query.district).toLowerCase() ||
            d.label === query.district,
        );
        if (found) {
          mappedQuery = { ...query, district: found.label };
        }
      }
    } catch {
      // Fallback to original query
    }
  }

  const params = buildQueryString(mappedQuery ?? {});
  return nextServerFetch<TSurveyorProfile[]>(`/surveyor${params}`, {
    auth: "none",
    next: { tags: [CACHE_TAGS.SURVEYORS], revalidate: 60 },
  });
};

export const getSurveyorBySlug = (slug: string) =>
  nextServerFetch<TSurveyorProfile>(`/surveyor/${slug}`, {
    auth: "none",
    next: { tags: [CACHE_TAGS.SURVEYOR_PROFILE], revalidate: 60 },
  });

export const applyAsSurveyor = (payload: unknown) =>
  nextServerFetch<TSurveyorProfile>("/surveyor/profile", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const updateMySurveyorProfile = (payload: unknown) =>
  nextServerFetch<TSurveyorProfile>("/surveyor/profile", {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

