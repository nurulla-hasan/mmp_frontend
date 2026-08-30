"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { updateMe, changePassword } from "@/services/auth.service";
import type { UpdateMeFormValues } from "@/validation/update-me.schema";
import type { ChangePasswordFormValues } from "@/validation/change-password.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";

export async function updateProfileAction(data: UpdateMeFormValues) {
  const result = await updateMe(data);
  if (result.success) {
    revalidateTag(CACHE_TAGS.ME, "max");
    revalidateTag(CACHE_TAGS.USERS, "max");
    revalidateTag(CACHE_TAGS.SURVEYORS, "max");
    revalidateTag(CACHE_TAGS.SURVEYOR_PROFILE, "max");
    revalidatePath("/dashboard/profile");
  }
  return result;
}

export async function changePasswordAction(data: ChangePasswordFormValues) {
  return await changePassword(data);
}
