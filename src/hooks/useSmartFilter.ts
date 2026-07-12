"use client";

import { useNextFilter, type NextFilterConfig } from "./useNextFilter";

export function useSmartFilter<T extends string = string>(
  config: NextFilterConfig = {},
) {
  return useNextFilter<T>(config);
}
