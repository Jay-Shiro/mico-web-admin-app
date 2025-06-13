"use client";

import { useState, useEffect } from "react";

/**
 * Hook to safely detect if component is mounted on client
 * Prevents hydration mismatches when using browser APIs
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * Hook for safely using browser APIs that may not be available during SSR
 */
export function useBrowserAPI<T>(browserAPIFn: () => T, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      try {
        setValue(browserAPIFn());
      } catch (error) {
        console.warn("Browser API access failed:", error);
        setValue(fallback);
      }
    }
  }, [isMounted, browserAPIFn, fallback]);

  return value;
}

export default useIsMounted;
