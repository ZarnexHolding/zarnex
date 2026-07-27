"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query as an external store. Returns `false` during SSR and on the
 * first client render, so markup always matches and there is no hydration
 * mismatch — motion features simply switch on a frame later.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
