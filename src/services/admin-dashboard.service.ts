import "server-only";

import type { TAdminDashboardStats } from "@/interface/admin-dashboard";
import { nextServerFetch } from "@/lib/nextServerFetch";
import { CACHE_TIME } from "@/lib/cache-tags";

// 1. Get Admin Dashboard Aggregated Stats
export const getAdminDashboardStats = () =>
  nextServerFetch<TAdminDashboardStats>("/admin/dashboard/stats", {
    auth: "auth",
    next: {
      revalidate: CACHE_TIME.FIVE_MINUTES,
    },
  });

