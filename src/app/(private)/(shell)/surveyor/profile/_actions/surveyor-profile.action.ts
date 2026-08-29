"use server";

import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  applyAsSurveyor,
  updateMySurveyorProfile,
  updateMe,
  getServices,
} from "@/services/auth.service";
import type { SurveyorProfileFormValues } from "@/validation/surveyor-profile.schema";
import { UpdateMeFormValues } from "@/validation/update-me.schema";

export async function applyAsSurveyorAction(
  data: SurveyorProfileFormValues,
){
  const servicesResult = await getServices();
  if (!servicesResult.success) {
    return { success: false, message: "সার্ভিস লোড করা যায়নি।" };
  }

  const slugToId = new Map<string, string>(
    servicesResult.data.map((s) => [s.slug, s.id]),
  );

  const payload = {
    headline: data.headline,
    bio: data.bio,
    experienceYears: data.experienceYears,
    serviceAreas: data.serviceAreas.map((a) => ({
      district: a.district,
      upazilas: a.upazilas,
    })),
    services: data.services.map((s) => ({
      serviceId: slugToId.get(s.slug) ?? s.slug,
      startingPrice: s.startingPrice ?? 0,
    })),
  };

  const result = await applyAsSurveyor(payload);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag(CACHE_TAGS.surveyorProfile);
  updateTag(CACHE_TAGS.user);
  return { success: true };
}

// PATCH /auth/me — normal user profile (name, phone, whatsappNumber)
export async function updateMeAction(data: UpdateMeFormValues) {
  const result = await updateMe(data);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag(CACHE_TAGS.user);
  return { success: true };
}

// PATCH /surveyor/profile — surveyor profile (headline, bio, experienceYears, serviceAreas, services)
export async function updateMySurveyorProfileAction(
  data: Partial<SurveyorProfileFormValues>,
) {
  const payload: Record<string, unknown> = {};
  if (data.headline !== undefined) payload.headline = data.headline;
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.experienceYears !== undefined) {
    payload.experienceYears = data.experienceYears;
  }
  if (data.serviceAreas !== undefined) {
    payload.serviceAreas = data.serviceAreas.map((a) => ({
      district: a.district,
      upazilas: a.upazilas,
    }));
  }
  if (data.services !== undefined) {
    payload.services = data.services.map((s) => ({
      serviceId: s.serviceId,
      startingPrice: s.startingPrice ?? 0,
    }));
  }

  const result = await updateMySurveyorProfile(payload);
  if (!result.success) {
    return { success: false, message: result.message };
  }

  updateTag(CACHE_TAGS.surveyorProfile);
  updateTag(CACHE_TAGS.user);
  return { success: true };
}
