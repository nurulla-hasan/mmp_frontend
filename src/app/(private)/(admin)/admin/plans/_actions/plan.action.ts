"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createPlan,
  updatePlan,
  togglePlanStatus,
  deletePlan,
} from "@/services/plan.service";
import type { CreatePlanPayload, UpdatePlanPayload } from "@/interface/plan";

export async function createPlanAction(payload: CreatePlanPayload) {
  const result = await createPlan(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.PLANS);
  }
  return result;
}

export async function updatePlanAction(id: string, payload: UpdatePlanPayload) {
  const result = await updatePlan(id, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.PLANS);
  }
  return result;
}

export async function togglePlanStatusAction(id: string) {
  const result = await togglePlanStatus(id);
  if (result.success) {
    updateTag(CACHE_TAGS.PLANS);
  }
  return result;
}

export async function deletePlanAction(id: string) {
  const result = await deletePlan(id);
  if (result.success) {
    updateTag(CACHE_TAGS.PLANS);
  }
  return result;
}

