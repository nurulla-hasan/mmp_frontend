"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  updateReviewStatus,
  deleteReview,
} from "@/services/review.service";

export async function updateReviewStatusAction(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  const result = await updateReviewStatus(id, status);
  if (result.success) {
    updateTag(CACHE_TAGS.REVIEWS);
    updateTag(CACHE_TAGS.SURVEYOR_PROFILE);
    updateTag(CACHE_TAGS.SURVEYORS);
  }
  return result;
}

export async function deleteReviewAction(id: string) {
  const result = await deleteReview(id);
  if (result.success) {
    updateTag(CACHE_TAGS.REVIEWS);
    updateTag(CACHE_TAGS.SURVEYOR_PROFILE);
    updateTag(CACHE_TAGS.SURVEYORS);
  }
  return result;
}
