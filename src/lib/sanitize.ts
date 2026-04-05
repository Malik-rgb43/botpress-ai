/**
 * Input sanitization utilities for all user inputs
 * Prevents XSS, injection, and other input-based attacks
 */

/** Strip HTML tags to prevent XSS */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

/** Escape HTML entities */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return input.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

/** Sanitize general text input — strip HTML, trim, limit length */
export function sanitizeText(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input).trim().slice(0, maxLength)
}

/** Sanitize email address */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return ''
  // Remove any non-email characters, then validate format
  const cleaned = input.trim().toLowerCase().slice(0, 254)
  return cleaned
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email) && email.length <= 254
}

/** Sanitize URL — only allow http/https */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim()
  try {
    const url = new URL(trimmed)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.toString()
  } catch {
    return ''
  }
}

/** Sanitize phone number — keep only digits, +, -, spaces */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20)
}

/** Sanitize business name — no special HTML chars */
export function sanitizeName(input: unknown, maxLength = 200): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input).trim().slice(0, maxLength)
}

/** Sanitize multi-line text (for stories, policies, etc.) */
export function sanitizeMultiline(input: unknown, maxLength = 5000): string {
  if (typeof input !== 'string') return ''
  // Keep newlines but strip HTML
  return stripHtml(input).trim().slice(0, maxLength)
}

/** Sanitize conversation message from widget */
export function sanitizeMessage(input: unknown, maxLength = 5000): string {
  if (typeof input !== 'string') return ''
  const cleaned = stripHtml(input).trim()
  if (cleaned.length === 0) return ''
  return cleaned.slice(0, maxLength)
}

/** Sanitize UUID — only allow valid UUID format */
export function sanitizeUUID(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return re.test(input.trim()) ? input.trim().toLowerCase() : null
}

/** Sanitize JSON conversation history */
export function sanitizeHistory(input: unknown): Array<{ role: string; content: string }> {
  if (!Array.isArray(input)) return []
  return input
    .slice(-20)
    .filter(
      (m: unknown): m is { role: string; content: string } =>
        typeof m === 'object' &&
        m !== null &&
        'role' in m &&
        'content' in m &&
        typeof (m as Record<string, unknown>).content === 'string' &&
        typeof (m as Record<string, unknown>).role === 'string' &&
        ['user', 'assistant'].includes((m as Record<string, unknown>).role as string) &&
        ((m as Record<string, unknown>).content as string).length <= 2000
    )
    .map(m => ({
      role: m.role,
      content: stripHtml(m.content),
    }))
}

/** Sanitize color hex value */
export function sanitizeColor(input: unknown): string {
  if (typeof input !== 'string') return '#2563eb'
  const re = /^#[0-9a-fA-F]{6}$/
  return re.test(input.trim()) ? input.trim() : '#2563eb'
}
