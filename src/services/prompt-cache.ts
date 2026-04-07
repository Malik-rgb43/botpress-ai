/**
 * In-memory cache for business data + system prompts
 * Avoids rebuilding the same prompt and querying DB on every request
 *
 * TTL: 2 minutes (business data rarely changes mid-conversation)
 *
 * NOTE: In-memory store does NOT persist across serverless invocations.
 * Each Vercel function instance has its own cache. This is acceptable
 * for prompt caching since it's a performance optimization, not correctness.
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttl = CACHE_TTL): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl })
}

export function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// Cleanup expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as { __promptCacheInterval?: ReturnType<typeof setInterval> }
  if (!g.__promptCacheInterval) {
    g.__promptCacheInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of cache.entries()) {
        if (now > entry.expiresAt) cache.delete(key)
      }
    }, 5 * 60 * 1000)
    // Prevent the interval from blocking Node.js/serverless shutdown
    if (g.__promptCacheInterval?.unref) g.__promptCacheInterval.unref()
  }
}
