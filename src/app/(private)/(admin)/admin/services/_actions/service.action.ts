"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createService,
  updateService,
  deleteService,
} from "@/services/service.service";
import type {
  CreateServicePayload,
  UpdateServicePayload,
} from "@/interface/service";

export async function createServiceAction(payload: CreateServicePayload) {
  const result = await createService(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SERVICES);
  }
  return result;
}

export async function updateServiceAction(
  idOrSlug: string,
  payload: UpdateServicePayload,
) {
  const result = await updateService(idOrSlug, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SERVICES);
  }
  return result;
}

export async function deleteServiceAction(idOrSlug: string) {
  const result = await deleteService(idOrSlug);
  if (result.success) {
    updateTag(CACHE_TAGS.SERVICES);
  }
  return result;
}
