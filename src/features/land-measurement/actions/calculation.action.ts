"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  saveCalculation,
  incrementPlotCount,
  getCalculations,
  deleteCalculation,
  getCalculationById,
} from "@/services/calculation.service";
import type { CreateCalculationPayload } from "@/interface/calculation";
import type { TQuery } from "@/interface/global";

export async function saveCalculationAction(payload: CreateCalculationPayload) {
  const result = await saveCalculation(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.CALCULATIONS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function incrementPlotCountAction() {
  const result = await incrementPlotCount();
  if (result.success) {
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}

export async function getCalculationsAction(query?: TQuery) {
  return await getCalculations(query);
}

export async function getCalculationByIdAction(id: string) {
  return await getCalculationById(id);
}

export async function deleteCalculationAction(id: string) {
  const result = await deleteCalculation(id);
  if (result.success) {
    updateTag(CACHE_TAGS.CALCULATIONS);
    updateTag(CACHE_TAGS.ME);
  }
  return result;
}
