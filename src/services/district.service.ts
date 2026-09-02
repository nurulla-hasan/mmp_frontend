import "server-only";

import { CACHE_TIME } from "@/lib/cache-tags";
import { nextServerFetch } from "@/lib/nextServerFetch";

export type TDistrictOption = {
  value: string;
  label: string;
  upazilas: string[];
};

// ── Districts (public catalog: value + label + upazilas) ──
export const getDistricts = () =>
  nextServerFetch<TDistrictOption[]>("/districts", {
    auth: "none",
    next: { revalidate: CACHE_TIME.DAY },
  });

