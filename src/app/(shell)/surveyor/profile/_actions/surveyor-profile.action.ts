"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { updateMe } from "@/services/auth.service";
import { updateMySurveyorProfile } from "@/services/surveyor.service";
import type { UpdateMeFormValues } from "@/validation/update-me.schema";
import type { SurveyorProfileFormValues } from "@/validation/surveyor-profile.schema";

// PATCH /auth/me — normal user profile (name, phone, whatsappNumber)
export async function updateMeAction(data: UpdateMeFormValues) {
  const result = await updateMe(data);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag(CACHE_TAGS.ME);
  return { success: true };
}

// PATCH /surveyor/profile — surveyor profile (headline, bio, experienceYears, serviceAreas, services)
export async function updateMySurveyorProfileAction(
  data: Partial<SurveyorProfileFormValues>,
) {
  const result = await updateMySurveyorProfile(data);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag(CACHE_TAGS.SURVEYOR_PROFILE);
  updateTag(CACHE_TAGS.ME);
  return { success: true };
}
