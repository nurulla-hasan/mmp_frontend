import "server-only";

import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";
import { nextServerFetch } from "@/lib/nextServerFetch";
import type {
  TDistrict,
  CreateDistrictPayload,
  UpdateDistrictPayload,
  CreateUpazilaPayload,
  UpdateUpazilaPayload,
  TUpazila,
} from "@/interface/district";

export type TDistrictOption = TDistrict;

// ── Districts (public catalog and admin list) ──
export const getDistricts = () =>
  nextServerFetch<TDistrict[]>("/districts", {
    auth: "none",
    next: {
      tags: [CACHE_TAGS.DISTRICTS],
      revalidate: CACHE_TIME.DAY,
    },
  });

export const createDistrict = (payload: CreateDistrictPayload) =>
  nextServerFetch<TDistrict>("/districts", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const updateDistrict = (id: string, payload: UpdateDistrictPayload) =>
  nextServerFetch<TDistrict>(`/districts/${id}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

export const deleteDistrict = (id: string) =>
  nextServerFetch<null>(`/districts/${id}`, {
    method: "DELETE",
    auth: "auth",
  });

// ── Upazilas ──
export const createUpazila = (payload: CreateUpazilaPayload) =>
  nextServerFetch<TUpazila>("/districts/upazila", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

export const updateUpazila = (id: string, payload: UpdateUpazilaPayload) =>
  nextServerFetch<TUpazila>(`/districts/upazila/${id}`, {
    method: "PATCH",
    body: payload,
    auth: "auth",
  });

export const deleteUpazila = (id: string) =>
  nextServerFetch<null>(`/districts/upazila/${id}`, {
    method: "DELETE",
    auth: "auth",
  });

