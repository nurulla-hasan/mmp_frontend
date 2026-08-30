"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createBroadcast,
  updateBroadcast,
  toggleBroadcastStatus,
  deleteBroadcast,
} from "@/services/broadcast.service";
import type {
  CreateBroadcastPayload,
  UpdateBroadcastPayload,
} from "@/interface/broadcast";

export async function createBroadcastAction(payload: CreateBroadcastPayload) {
  const result = await createBroadcast(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.BROADCASTS);
  }
  return result;
}

export async function updateBroadcastAction(
  id: string,
  payload: UpdateBroadcastPayload,
) {
  const result = await updateBroadcast(id, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.BROADCASTS);
  }
  return result;
}

export async function toggleBroadcastStatusAction(id: string) {
  const result = await toggleBroadcastStatus(id);
  if (result.success) {
    updateTag(CACHE_TAGS.BROADCASTS);
  }
  return result;
}

export async function deleteBroadcastAction(id: string) {
  const result = await deleteBroadcast(id);
  if (result.success) {
    updateTag(CACHE_TAGS.BROADCASTS);
  }
  return result;
}

