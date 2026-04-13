/**
 * Rate limiter — Upstash Redis (production) with in-memory fallback (dev)
 *
 * Production: Uses @upstash/ratelimit with Redis for distributed rate limiting
 * Development: Falls back to in-memory Map when UPSTASH_REDIS_REST_URL is not set
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ── Configuration ──────────────────────────────

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const useRedis = !!(UPSTASH_URL && UPSTASH_TOKEN)

// ── Upstash rate limiters per endpoint type ────

const redis = useRedis ? new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! }) : null

function createLimiter(limit: number, windowSeconds: number) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
    })
  }
  return null // fallback to in-memory
}

// Pre-built limiters for each endpoint
const limiters = {
  chat: createLimiter(30, 60),
  widget: createLimiter(60, 60),
  webhook: createLimiter(100, 60),
  email_poll: createLimiter(10, 60),
  summary: createLimiter(5, 3600),
  generate: createLimiter(10, 3600),
  'scan-website': createLimiter(3, 3600),
  'generate-faq': createLimiter(5, 3600),
  'agent-reply': createLimiter(20, 60),
  'email-inbound': createLimiter(60, 60),
  'email-test': createLimiter(3, 3600),
  'landing-chat': createLimiter(15, 60),
}

// ── In-memory fallback ─────────────────────────
// (kept for local dev when Upstash is not configured)

interface RateLimitEntry { count: number; resetAt: number }
const memStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as { __rlInterval?: ReturnType<typeof setInterval> }
  if (!g.__rlInterval) {
    g.__rlInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of memStore.entries()) {
        if (now > entry.resetAt) memStore.delete(key)
      }
    }, 5 * 60 * 1000)
    if (g.__rlInterval?.unref) g.__rlInterval.unref()
  }
}

// ── Public API ─────────────────────────────────

export interface RateLimitConfig {
  limit: number
  windowMs: number
}

export const RATE_LIMITS = {
  chat: { limit: 30, windowMs: 60 * 1000 },
  widget: { limit: 60, windowMs: 60 * 1000 },
  webhook: { limit: 100, windowMs: 60 * 1000 },
  email_poll: { limit: 10, windowMs: 60 * 1000 },
  summary: { limit: 5, windowMs: 60 * 60 * 1000 },
  generate: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; retryAfter?: number; remaining: number }> {
  // Try Upstash first
  const endpointType = key.split(':')[2] || ''
  const limiter = limiters[endpointType as keyof typeof limiters]

  if (limiter) {
    try {
      const result = await limiter.limit(key)
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
      }
    } catch {
      // Redis error — fall through to in-memory
    }
  }

  // In-memory fallback
  const now = Date.now()
  const entry = memStore.get(key)
  if (!entry || now > entry.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.limit - 1 }
  }
  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter, remaining: 0 }
  }
  entry.count++
  return { allowed: true, remaining: config.limit - entry.count }
}

export function getRateLimitKey(request: Request, ...parts: string[]): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `rl:${ip}:${parts.join(':')}`
}
