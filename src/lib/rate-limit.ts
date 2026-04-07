/**
 * Rate limiter for serverless environments (Vercel)
 *
 * NOTE: In-memory store does NOT persist across serverless invocations.
 * This provides per-instance rate limiting which helps with burst traffic
 * but won't enforce limits across distributed instances.
 * For production: migrate to Vercel KV, Upstash Redis, or Supabase-based limiter.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as { __rateLimitInterval?: ReturnType<typeof setInterval> }
  if (!g.__rateLimitInterval) {
    g.__rateLimitInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) store.delete(key)
      }
    }, 5 * 60 * 1000)
    // Prevent the interval from blocking Node.js/serverless shutdown
    if (g.__rateLimitInterval?.unref) g.__rateLimitInterval.unref()
  }
}

interface RateLimitConfig {
  /** Max requests in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

/** Default rate limits per endpoint type */
export const RATE_LIMITS = {
  chat: { limit: 30, windowMs: 60 * 1000 },         // 30 req/min per business
  widget: { limit: 60, windowMs: 60 * 1000 },        // 60 req/min per conversation
  webhook: { limit: 100, windowMs: 60 * 1000 },      // 100 req/min per source
  email_poll: { limit: 10, windowMs: 60 * 1000 },    // 10 req/min
  summary: { limit: 5, windowMs: 60 * 60 * 1000 },   // 5 req/hour
  generate: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 req/hour
} as const

/**
 * Check rate limit for a given key
 * Returns { allowed: true } or { allowed: false, retryAfter }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; retryAfter?: number; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1 }
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: config.limit - entry.count }
}

/**
 * Extract client identifier for rate limiting
 * Uses IP + businessId for business-scoped limits
 */
export function getRateLimitKey(request: Request, ...parts: string[]): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `rl:${ip}:${parts.join(':')}`
}
