/**
 * Simple server-side cache utility for API responses
 */

type CacheEntry = {
  data: any;
  timestamp: number;
};

class ApiCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 60 * 1000; // 1 minute in milliseconds

  /**
   * Get an item from the cache
   * @param key Cache key
   * @param ttl Time to live in milliseconds, defaults to 1 minute
   * @returns Cached data or null if expired/not found
   */
  get(key: string, ttl = this.defaultTTL): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > ttl) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Delete an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear all cache entries that match a prefix
   * @param prefix Key prefix to match
   */
  clearByPrefix(prefix: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export a singleton instance
const apiCache = new ApiCache();
export default apiCache;
