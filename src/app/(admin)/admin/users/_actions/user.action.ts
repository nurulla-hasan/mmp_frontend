"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "@/services/user.service";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { TUserRole, TUserStatus } from "@/interface/user";

export async function updateUserStatusAction(id: string, status: TUserStatus) {
  try {
    const res = await updateUserStatus(id, status);
    if (res.success) {
      revalidateTag(CACHE_TAGS.USERS, "max");
      revalidatePath("/admin/users");
    }
    return res;
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "Failed to update user status.",
    };
  }
}

export async function updateUserRoleAction(id: string, role: TUserRole) {
  try {
    const res = await updateUserRole(id, role);
    if (res.success) {
      revalidateTag(CACHE_TAGS.USERS, "max");
      revalidatePath("/admin/users");
    }
    return res;
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "Failed to update user role.",
    };
  }
}

export async function deleteUserAction(id: string) {
  try {
    const res = await deleteUser(id);
    if (res.success) {
      revalidateTag(CACHE_TAGS.USERS, "max");
      revalidatePath("/admin/users");
    }
    return res;
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "Failed to delete user account.",
    };
  }
}
