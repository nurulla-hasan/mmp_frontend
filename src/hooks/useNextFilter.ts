"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type NavigationMethod = "push" | "replace";

interface FilterOptions {
  debounce?: number;
  method?: NavigationMethod;
  resetPage?: boolean;
  scroll?: boolean;
}

interface UseNextFilterOptions {
  defaultDebounce?: number;
  defaultMethod?: NavigationMethod;
  paginationKey?: string;
}

export function useNextFilter(options: UseNextFilterOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach(clearTimeout);
      activeTimers.clear();
    };
  }, []);

  const paramsString = searchParams.toString();

  const getFilter = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams],
  );

  const updateFilter = useCallback(
    (
      key: string,
      value: string | number | boolean | null | undefined,
      filterOptions: FilterOptions = {},
    ) => {
      const navigate = () => {
        const params = new URLSearchParams(searchParams.toString());
        const normalizedValue = value == null ? "" : String(value);

        if (normalizedValue) params.set(key, normalizedValue);
        else params.delete(key);

        if (filterOptions.resetPage !== false && key !== (options.paginationKey ?? "page")) {
          params.delete(options.paginationKey ?? "page");
        }

        const query = params.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        const method = filterOptions.method ?? options.defaultMethod ?? "replace";
        const navigationOptions = { scroll: filterOptions.scroll ?? false };

        if (method === "push") router.push(url, navigationOptions);
        else router.replace(url, navigationOptions);
      };

      const delay = filterOptions.debounce ?? options.defaultDebounce ?? 0;
      const previousTimer = timers.current.get(key);
      if (previousTimer) clearTimeout(previousTimer);

      if (delay > 0) {
        timers.current.set(
          key,
          setTimeout(() => {
            timers.current.delete(key);
            navigate();
          }, delay),
        );
      } else {
        navigate();
      }
    },
    [options.defaultDebounce, options.defaultMethod, options.paginationKey, pathname, router, searchParams],
  );

  return { getFilter, updateFilter, paramsString };
}
