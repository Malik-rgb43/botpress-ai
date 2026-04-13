import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY not set')
  // Key should be 32 bytes (256 bits), base64 encoded in env
  return Buffer.from(key, 'base64')
}

export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(text, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: base64(iv + tag + ciphertext)
  const combined = Buffer.concat([iv, tag, encrypted])
  return combined.toString('base64')
}

export function decrypt(encryptedBase64: string): string {
  const key = getKey()
  const combined = Buffer.from(encryptedBase64, 'base64')
  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  let decrypted = decipher.update(ciphertext)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}

// Check if a string looks like an encrypted token (base64 with min length)
export function isEncrypted(value: string): boolean {
  if (!value || value.length < 40) return false
  try {
    const buf = Buffer.from(value, 'base64')
    return buf.length > IV_LENGTH + TAG_LENGTH
  } catch {
    return false
  }
}

// Safely decrypt a token — returns plaintext if not encrypted (backwards compat)
export function safeDecrypt(value: string): string {
  if (!value) return value
  if (!process.env.ENCRYPTION_KEY) return value
  if (!isEncrypted(value)) return value
  try {
    return decrypt(value)
  } catch {
    // If decryption fails, assume it's a plaintext token
    return value
  }
}

// Safely encrypt a token — returns plaintext if ENCRYPTION_KEY not set
export function safeEncrypt(value: string): string {
  if (!value) return value
  if (!process.env.ENCRYPTION_KEY) return value
  return encrypt(value)
}
