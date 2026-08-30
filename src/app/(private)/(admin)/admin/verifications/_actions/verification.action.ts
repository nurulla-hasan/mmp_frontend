"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { verifySurveyor } from "@/services/verification.service";
import type { VerifySurveyorPayload } from "@/interface/verification";

export async function verifySurveyorAction(
  userId: string,
  payload: VerifySurveyorPayload,
) {
  const result = await verifySurveyor(userId, payload);
  if (result.success) {
    updateTag(CACHE_TAGS.SURVEYORS);
    updateTag(CACHE_TAGS.USERS);
  }
  return result;
}

