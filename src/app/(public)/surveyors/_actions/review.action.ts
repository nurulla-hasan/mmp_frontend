"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createReview } from "@/services/review.service";
import type { CreateReviewPayload } from "@/interface/review";

export async function createReviewAction(payload: CreateReviewPayload) {
  const result = await createReview(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.REVIEWS);
    updateTag(CACHE_TAGS.SURVEYOR_PROFILE);
    updateTag(CACHE_TAGS.SURVEYORS);
  }
  return result;
}
