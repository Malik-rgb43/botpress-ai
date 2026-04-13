import crypto from 'crypto'

// Generate a secure random widget token
export function generateWidgetToken(): string {
  return crypto.randomBytes(24).toString('hex') // 48 char hex string
}
