import "server-only";

import type {
  TUser,
  TUserQuery,
  TUserRole,
  TUserStatus,
  CreateAdminPayload,
} from "@/interface/user";
import { buildQueryString } from "@/lib/buildQueryString";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TAGS, CACHE_TIME } from "@/lib/cache-tags";

// 1. Get all users for admin
export const getUsers = (query?: TUserQuery) => {
  const params = buildQueryString(query ?? {});
  return nextServerFetch<TUser[]>(`/users${params}`, {
    auth: "auth",
    next: { tags: [CACHE_TAGS.USERS], revalidate: CACHE_TIME.DAY },
  });
};

// 2. Create new Admin
export const createAdmin = (payload: CreateAdminPayload) =>
  nextServerFetch<TUser>("/users/create-admin", {
    method: "POST",
    body: payload,
    auth: "auth",
  });

// 3. Update user status (ACTIVE | BLOCKED)
export const updateUserStatus = (id: string, status: TUserStatus) =>
  nextServerFetch<TUser>(`/users/${id}/status`, {
    method: "PATCH",
    body: { status },
    auth: "auth",
  });

// 4. Update user role (USER | SURVEYOR | ADMIN)
export const updateUserRole = (id: string, role: TUserRole) =>
  nextServerFetch<TUser>(`/users/${id}/role`, {
    method: "PATCH",
    body: { role },
    auth: "auth",
  });

// 5. Delete user
export const deleteUser = (id: string) =>
  nextServerFetch<null>(`/users/${id}`, {
    method: "DELETE",
    auth: "auth",
  });

// 6. Upload user profile image
export const uploadProfileImage = (formData: FormData) =>
  nextServerFetch<TUser>("/users/profile-image", {
    method: "PATCH",
    body: formData,
    auth: "auth",
  });
