// Sentry error tracking configuration
// Install: npm install @sentry/nextjs
// Then set NEXT_PUBLIC_SENTRY_DSN and SENTRY_AUTH_TOKEN in env vars

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || ''

export function isSentryEnabled() {
  return SENTRY_DSN.length > 0
}
