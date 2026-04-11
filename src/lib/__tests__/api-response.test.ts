import { describe, it, expect, vi } from 'vitest'

// Mock NextResponse since it depends on Next.js runtime
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}))

import { ok, badRequest, unauthorized, forbidden, notFound, rateLimited, serverError } from '../api-response'

describe('ok', () => {
  it('returns 200 with data', () => {
    const result = ok({ success: true }) as unknown as { body: unknown; status: number }
    expect(result.status).toBe(200)
    expect(result.body).toEqual({ success: true })
  })
})

describe('badRequest', () => {
  it('returns 400 with error message', () => {
    const result = badRequest('Invalid input') as unknown as { body: { error: string }; status: number }
    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Invalid input')
  })
})

describe('unauthorized', () => {
  it('returns 401 with default message', () => {
    const result = unauthorized() as unknown as { body: { error: string }; status: number }
    expect(result.status).toBe(401)
    expect(result.body.error).toBe('Unauthorized')
  })

  it('returns 401 with custom message', () => {
    const result = unauthorized('Token expired') as unknown as { body: { error: string }; status: number }
    expect(result.status).toBe(401)
    expect(result.body.error).toBe('Token expired')
  })
})

describe('forbidden', () => {
  it('returns 403 with default message', () => {
    const result = forbidden() as unknown as { body: { error: string }; status: number }
    expect(result.status).toBe(403)
    expect(result.body.error).toBe('Forbidden')
  })
})

describe('notFound', () => {
  it('returns 404 with default message', () => {
    const result = notFound() as unknown as { body: { error: string }; status: number }
    expect(result.status).toBe(404)
    expect(result.body.error).toBe('Not found')
  })
})

describe('rateLimited', () => {
  it('returns 429 with retryAfter', () => {
    const result = rateLimited(30) as unknown as { body: { error: string; retryAfter: number }; status: number }
    expect(result.status).toBe(429)
    expect(result.body.error).toBe('Too many requests')
    expect(result.body.retryAfter).toBe(30)
  })

  it('returns 429 without retryAfter', () => {
    const result = rateLimited() as unknown as { body: { error: string; retryAfter: undefined }; status: number }
    expect(result.status).toBe(429)
    expect(result.body.retryAfter).toBeUndefined()
  })
})

describe('serverError', () => {
  it('returns 500 with default message', () => {
    const result = serverError() as unknown as { body: { error: string }; status: number }
    expect(result.status).toBe(500)
    expect(result.body.error).toBe('Internal server error')
  })
})
