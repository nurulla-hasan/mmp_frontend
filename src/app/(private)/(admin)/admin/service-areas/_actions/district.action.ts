"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createDistrict,
  updateDistrict,
  deleteDistrict,
  createUpazila,
  updateUpazila,
  deleteUpazila,
} from "@/services/district.service";
import type {
  CreateDistrictPayload,
  UpdateDistrictPayload,
  CreateUpazilaPayload,
  UpdateUpazilaPayload,
} from "@/interface/district";

export async function createDistrictAction(payload: CreateDistrictPayload) {
  const result = await createDistrict(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.DISTRICTS);
  }
  return result;
}

export async function updateDistrictAction(
  id: string,
  payload: UpdateDistrictPayload,
) {
  const result = await updateDistrict(id, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.DISTRICTS);
  }
  return result;
}

export async function deleteDistrictAction(id: string) {
  const result = await deleteDistrict(id);
  if (result.success) {
    updateTag(CACHE_TAGS.DISTRICTS);
  }
  return result;
}

export async function createUpazilaAction(payload: CreateUpazilaPayload) {
  const result = await createUpazila(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.DISTRICTS);
  }
  return result;
}

export async function updateUpazilaAction(
  id: string,
  payload: UpdateUpazilaPayload,
) {
  const result = await updateUpazila(id, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.DISTRICTS);
  }
  return result;
}

export async function deleteUpazilaAction(id: string) {
  const result = await deleteUpazila(id);
  if (result.success) {
    updateTag(CACHE_TAGS.DISTRICTS);
  }
  return result;
}
