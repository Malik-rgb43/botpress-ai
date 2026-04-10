/**
 * Rate limiter for serverless environments (Vercel)
 *
 * ⚠️ PRODUCTION LIMITATION: In-memory store does NOT persist across serverless
 * invocations. Each Vercel function instance has its own Map. This provides
 * per-instance burst protection but a determined attacker hitting different
 * instances in parallel will bypass limits.
 *
 * For production with real abuse protection, migrate expensive endpoints
 * (scan-website, generate-faq) to one of:
 *   - Vercel KV (@vercel/kv) — simplest, native integration
 *   - Upstash Redis (@upstash/ratelimit) — purpose-built, sliding window
 *   - The Go rate-limiter in tools/rate-limiter/ — standalone, token bucket
 *
 * The current in-memory approach is acceptable for:
 *   - WhatsApp/Email inbound (senders verified by Meta/Resend)
 *   - Widget messages (low abuse risk, high volume)
 *   - Agent replies (authenticated users only)
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
