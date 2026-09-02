"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { applyAsSurveyor } from "@/services/surveyor.service";
import type { JoinAsSurveyorFormValues } from "@/validation/join-as-surveyor.schema";

export async function submitSurveyorApplicationAction(
  data: JoinAsSurveyorFormValues,
) {
  const payload = {
    headline: data.headline,
    bio: data.bio || undefined,
    experienceYears: Number(data.experienceYears) || 0,
    certificateUrl: data.certificateUrl || undefined,
    serviceAreas: data.serviceAreas.map((a) => ({
      district: a.district,
      upazilas: a.upazilas,
    })),
    services: data.services.map((s) => ({
      serviceId: s.serviceId,
      startingPrice: Number(s.startingPrice) || 0,
    })),
  };

  const result = await applyAsSurveyor(payload);
  if (!result.success) {
    return { success: false, message: result.message || "আবেদন জমা দিতে সমস্যা হয়েছে।" };
  }

  updateTag(CACHE_TAGS.SURVEYOR_PROFILE);
  updateTag(CACHE_TAGS.ME);
  return { success: true, message: "আপনার আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাইয়ের পর প্রোফাইল সচল হবে।" };
}
