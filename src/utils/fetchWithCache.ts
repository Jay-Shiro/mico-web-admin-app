import apiCache from "./apiCache";

interface FetchOptions extends RequestInit {
  cacheTTL?: number;
  bypassCache?: boolean;
}

/**
 * Fetch data with caching
 * @param url The URL to fetch
 * @param options Fetch options plus cache control options
 * @returns Fetched data
 */
export async function fetchWithCache(url: string, options: FetchOptions = {}) {
  const {
    cacheTTL = 60 * 1000,
    bypassCache = false,
    ...fetchOptions
  } = options;

  // Generate cache key from URL and any body content
  const cacheKey = `${url}-${JSON.stringify(fetchOptions.body || "")}`;

  // Check cache first (unless bypassing)
  if (!bypassCache) {
    const cachedData = apiCache.get(cacheKey, cacheTTL);
    if (cachedData) {
      return cachedData;
    }
  }

  // Fetch fresh data
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Store in cache
  apiCache.set(cacheKey, data);

  return data;
}
