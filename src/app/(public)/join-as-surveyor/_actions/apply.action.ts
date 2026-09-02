"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  applyAsSurveyor,
  uploadCertificate,
  deleteCertificate,
} from "@/services/surveyor.service";
import type { JoinAsSurveyorFormValues } from "@/validation/join-as-surveyor.schema";

export async function uploadCertificateAction(formData: FormData) {
  const result = await uploadCertificate(formData);
  if (!result.success || !result.data) {
    return {
      success: false as const,
      message: result.message || "সার্টিফিকেট আপলোড করতে ব্যর্থ হয়েছে।",
    };
  }
  return {
    success: true as const,
    data: result.data,
  };
}

export async function deleteCertificateAction(publicId: string) {
  const result = await deleteCertificate(publicId);
  return result;
}

export async function submitSurveyorApplicationAction(
  data: JoinAsSurveyorFormValues & { certificatePublicId?: string },
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
    // If surveyor creation fails, immediately clean up uploaded certificate so Cloudinary doesn't waste space!
    if (data.certificatePublicId) {
      await deleteCertificate(data.certificatePublicId).catch(() => {});
    }
    return {
      success: false,
      message: result.message || "আবেদন জমা দিতে সমস্যা হয়েছে।",
    };
  }

  updateTag(CACHE_TAGS.SURVEYOR_PROFILE);
  updateTag(CACHE_TAGS.ME);
  return {
    success: true,
    message:
      "আপনার আবেদন সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাইয়ের পর প্রোফাইল সচল হবে।",
  };
}

