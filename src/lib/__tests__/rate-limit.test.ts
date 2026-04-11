import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '../rate-limit'

describe('checkRateLimit', () => {
  it('allows requests within the limit', () => {
    const key = `test-allow-${Date.now()}`
    const config = { limit: 5, windowMs: 60_000 }

    const result = checkRateLimit(key, config)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('remaining count decreases with each request', () => {
    const key = `test-remaining-${Date.now()}`
    const config = { limit: 5, windowMs: 60_000 }

    const r1 = checkRateLimit(key, config)
    expect(r1.remaining).toBe(4)

    const r2 = checkRateLimit(key, config)
    expect(r2.remaining).toBe(3)

    const r3 = checkRateLimit(key, config)
    expect(r3.remaining).toBe(2)
  })

  it('blocks requests exceeding the limit', () => {
    const key = `test-block-${Date.now()}`
    const config = { limit: 3, windowMs: 60_000 }

    checkRateLimit(key, config) // 1
    checkRateLimit(key, config) // 2
    checkRateLimit(key, config) // 3

    const result = checkRateLimit(key, config) // 4 — should be blocked

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('starts a new window after expiry', () => {
    const key = `test-expiry-${Date.now()}`
    const config = { limit: 1, windowMs: 100 } // 100ms window

    const r1 = checkRateLimit(key, config)
    expect(r1.allowed).toBe(true)

    const r2 = checkRateLimit(key, config)
    expect(r2.allowed).toBe(false)

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const r3 = checkRateLimit(key, config)
        expect(r3.allowed).toBe(true)
        expect(r3.remaining).toBe(0) // limit 1, used 1 => 0 remaining
        resolve()
      }, 150)
    })
  })
})

describe('getRateLimitKey', () => {
  it('generates correct key from IP and parts', () => {
    const mockRequest = {
      headers: {
        get: (name: string) =>
          name === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null,
      },
    } as unknown as Request

    const key = getRateLimitKey(mockRequest, 'chat', 'biz-123')
    expect(key).toBe('rl:1.2.3.4:chat:biz-123')
  })

  it('uses "unknown" when no IP header is present', () => {
    const mockRequest = {
      headers: {
        get: () => null,
      },
    } as unknown as Request

    const key = getRateLimitKey(mockRequest, 'widget')
    expect(key).toBe('rl:unknown:widget')
  })

  it('handles multiple parts', () => {
    const mockRequest = {
      headers: {
        get: (name: string) =>
          name === 'x-forwarded-for' ? '10.0.0.1' : null,
      },
    } as unknown as Request

    const key = getRateLimitKey(mockRequest, 'a', 'b', 'c')
    expect(key).toBe('rl:10.0.0.1:a:b:c')
  })
})

describe('RATE_LIMITS', () => {
  it('has expected endpoint configs', () => {
    expect(RATE_LIMITS.chat.limit).toBe(30)
    expect(RATE_LIMITS.widget.limit).toBe(60)
    expect(RATE_LIMITS.summary.windowMs).toBe(60 * 60 * 1000)
  })
})
