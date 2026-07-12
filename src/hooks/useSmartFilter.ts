"use client";

import { useNextFilter } from "./useNextFilter";

interface SmartFilterOptions {
  defaultDebounce?: number;
  defaultMethod?: "push" | "replace";
  paginationKey?: string;
}

export function useSmartFilter<TValue extends string | number | boolean = string>(
  options: SmartFilterOptions = {},
) {
  const filter = useNextFilter(options);

  return {
    ...filter,
    getFilter: (key: string) => filter.getFilter(key) as TValue,
  };
}
