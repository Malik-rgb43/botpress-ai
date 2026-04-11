import { NextResponse } from 'next/server'

export function ok(data: unknown) {
  return NextResponse.json(data)
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function rateLimited(retryAfter?: number) {
  return NextResponse.json(
    { error: 'Too many requests', retryAfter },
    { status: 429 }
  )
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 })
}
