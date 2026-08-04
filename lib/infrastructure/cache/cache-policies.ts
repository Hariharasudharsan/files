/**
 * Global cache version. Incrementing this string will instantly invalidate
 * the entire enterprise caching subsystem across all domains.
 */
export const CACHE_VERSION = "v1";

/**
 * Cache namespaces for different domains of the application.
 */
export const CacheNamespaces = {
  CATALOG: `catalog:${CACHE_VERSION}`,
  SEARCH: `search:${CACHE_VERSION}`,
  CMS: `cms:${CACHE_VERSION}`,
  SETTINGS: `settings:${CACHE_VERSION}`,
};

/**
 * Enterprise Cache Policies defining TTLs and key generators.
 * TTLs are defined in seconds.
 */
export const CachePolicy = {
  Catalog: {
    Published: {
      key: () => `${CacheNamespaces.CATALOG}:published`,
      ttl: 900, // 15 mins
    },
    ProductDetail: {
      key: (slug: string) => `${CacheNamespaces.CATALOG}:product:${slug}`,
      ttl: 1800, // 30 mins
    },
    Category: {
      key: (slug: string) => `${CacheNamespaces.CATALOG}:category:${slug}`,
      ttl: 3600, // 1 hour
    },
  },
  Search: {
    Query: {
      key: (query: string) => `${CacheNamespaces.SEARCH}:query:${query}`,
      ttl: 600, // 10 mins
    },
  },
  Metrics: {
    // Metrics keys are not versioned so they persist across cache flushes
    Hits: "cache:metrics:hits",
    Misses: "cache:metrics:misses",
  }
};
