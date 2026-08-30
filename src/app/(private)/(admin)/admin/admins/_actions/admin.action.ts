"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  createAdmin,
  updateUserStatus,
  deleteUser,
} from "@/services/user.service";
import type { CreateAdminPayload, TUserStatus } from "@/interface/user";

export async function createAdminAction(payload: CreateAdminPayload) {
  const result = await createAdmin(payload);
  if (result.success) {
    updateTag(CACHE_TAGS.USERS);
  }
  return result;
}

export async function updateAdminStatusAction(
  id: string,
  status: TUserStatus,
) {
  const result = await updateUserStatus(id, status);
  if (result.success) {
    updateTag(CACHE_TAGS.USERS);
  }
  return result;
}

export async function deleteAdminAction(id: string) {
  const result = await deleteUser(id);
  if (result.success) {
    updateTag(CACHE_TAGS.USERS);
  }
  return result;
}

