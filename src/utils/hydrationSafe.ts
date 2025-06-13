/**
 * Hydration Safety Configuration
 *
 * This file contains utilities and configurations to prevent
 * React hydration mismatches between server and client.
 */

// Safe way to check if we're on the client side
export const isClient = typeof window !== "undefined";

// Safe way to check if we're on the server side
export const isServer = typeof window === "undefined";

// Safe way to get current date that works in SSR
export function getSafeDate(fallback?: Date): Date | null {
  if (isServer) return fallback || null;
  return new Date();
}

// Safe way to get random values that are consistent between SSR and client
export function getSafeRandom(seed: number): number {
  // Simple seeded random function for deterministic values
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Safe way to access localStorage
export function getSafeLocalStorage(
  key: string,
  defaultValue: string = ""
): string {
  if (isServer) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
}

// Safe way to access sessionStorage
export function getSafeSessionStorage(
  key: string,
  defaultValue: string = ""
): string {
  if (isServer) return defaultValue;
  try {
    return sessionStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
}

// Safe way to get window dimensions
export function getSafeWindowDimensions() {
  if (isServer) return { width: 0, height: 0 };
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// Safe way to get user agent
export function getSafeUserAgent(): string {
  if (isServer) return "";
  return navigator.userAgent;
}

// Safe way to check if device is mobile
export function getIsMobile(): boolean {
  if (isServer) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Configuration for hydration-safe components
export const HYDRATION_CONFIG = {
  // Delay before showing client-only content
  CLIENT_RENDER_DELAY: 0,

  // Default values for SSR
  DEFAULT_WINDOW_WIDTH: 1024,
  DEFAULT_WINDOW_HEIGHT: 768,

  // Safe animation defaults
  DEFAULT_ANIMATION_DURATION: 300,
  DEFAULT_ANIMATION_DELAY: 0,
} as const;
