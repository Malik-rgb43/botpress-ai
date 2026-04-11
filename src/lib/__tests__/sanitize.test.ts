import { describe, it, expect } from 'vitest'
import {
  stripHtml,
  escapeHtml,
  sanitizeText,
  sanitizeEmail,
  isValidEmail,
  sanitizeUrl,
  sanitizePhone,
  sanitizeName,
  sanitizeMessage,
  sanitizeUUID,
  sanitizeMultiline,
  sanitizeHistory,
  sanitizeColor,
} from '../sanitize'

describe('stripHtml', () => {
  it('strips HTML tags from input', () => {
    expect(stripHtml('<b>hello</b>')).toBe('hello')
    expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")')
    expect(stripHtml('no tags')).toBe('no tags')
  })

  it('strips nested tags', () => {
    expect(stripHtml('<div><p>nested</p></div>')).toBe('nested')
  })
})

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('&')).toBe('&amp;')
    expect(escapeHtml('<')).toBe('&lt;')
    expect(escapeHtml('>')).toBe('&gt;')
    expect(escapeHtml('"')).toBe('&quot;')
    expect(escapeHtml("'")).toBe('&#x27;')
  })

  it('escapes a mixed string', () => {
    expect(escapeHtml('<b>"hi" & \'bye\'</b>')).toBe(
      '&lt;b&gt;&quot;hi&quot; &amp; &#x27;bye&#x27;&lt;&#x2F;b&gt;'
    )
  })
})

describe('sanitizeText', () => {
  it('strips HTML and trims', () => {
    expect(sanitizeText('  <b>hello</b>  ')).toBe('hello')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('')
    expect(sanitizeText(undefined)).toBe('')
    expect(sanitizeText(123)).toBe('')
  })

  it('truncates to maxLength', () => {
    expect(sanitizeText('a'.repeat(3000), 100)).toBe('a'.repeat(100))
  })
})

describe('sanitizeEmail', () => {
  it('lowercases and trims email', () => {
    expect(sanitizeEmail('  Test@Example.COM  ')).toBe('test@example.com')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeEmail(null)).toBe('')
    expect(sanitizeEmail(42)).toBe('')
  })
})

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('a@b.co')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('@missing-local.com')).toBe(false)
    expect(isValidEmail('missing@.com')).toBe(false)
  })
})

describe('sanitizeUrl', () => {
  it('accepts http/https urls', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path')
  })

  it('rejects non-http protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl('ftp://server.com')).toBe('')
  })

  it('returns empty for invalid urls', () => {
    expect(sanitizeUrl('not a url')).toBe('')
    expect(sanitizeUrl(null)).toBe('')
  })
})

describe('sanitizePhone', () => {
  it('keeps valid phone characters', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567')
  })

  it('strips invalid characters', () => {
    expect(sanitizePhone('abc+123def')).toBe('+123')
  })

  it('returns empty for non-string', () => {
    expect(sanitizePhone(undefined)).toBe('')
  })
})

describe('sanitizeMessage', () => {
  it('strips HTML from message', () => {
    expect(sanitizeMessage('<script>bad</script>hello')).toBe('bad hello'.replace(' ', ''))
    // More precisely:
    expect(sanitizeMessage('<b>hello</b> world')).toBe('hello world')
  })

  it('returns empty for empty/whitespace input', () => {
    expect(sanitizeMessage('')).toBe('')
    expect(sanitizeMessage('   ')).toBe('')
  })

  it('returns empty for non-string', () => {
    expect(sanitizeMessage(null)).toBe('')
    expect(sanitizeMessage(undefined)).toBe('')
  })

  it('truncates long messages', () => {
    const long = 'x'.repeat(6000)
    expect(sanitizeMessage(long).length).toBe(5000)
  })
})

describe('sanitizeUUID', () => {
  it('accepts valid UUIDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(sanitizeUUID(uuid)).toBe(uuid)
  })

  it('lowercases valid UUIDs', () => {
    const upper = '550E8400-E29B-41D4-A716-446655440000'
    expect(sanitizeUUID(upper)).toBe(upper.toLowerCase())
  })

  it('returns null for invalid UUIDs', () => {
    expect(sanitizeUUID('not-a-uuid')).toBeNull()
    expect(sanitizeUUID('550e8400-e29b-41d4-a716')).toBeNull()
    expect(sanitizeUUID('')).toBeNull()
  })

  it('returns null for non-string input', () => {
    expect(sanitizeUUID(null)).toBeNull()
    expect(sanitizeUUID(undefined)).toBeNull()
    expect(sanitizeUUID(123)).toBeNull()
  })
})

describe('sanitizeHistory', () => {
  it('returns empty array for non-array input', () => {
    expect(sanitizeHistory(null)).toEqual([])
    expect(sanitizeHistory('string')).toEqual([])
  })

  it('filters invalid messages', () => {
    const input = [
      { role: 'user', content: 'hi' },
      { role: 'invalid', content: 'bad' },
      { role: 'assistant', content: 'hello' },
      'not an object',
      null,
    ]
    const result = sanitizeHistory(input)
    expect(result).toHaveLength(2)
    expect(result[0].role).toBe('user')
    expect(result[1].role).toBe('assistant')
  })

  it('limits to 20 messages', () => {
    const input = Array.from({ length: 30 }, (_, i) => ({
      role: 'user',
      content: `msg ${i}`,
    }))
    expect(sanitizeHistory(input)).toHaveLength(20)
  })

  it('strips HTML from message content', () => {
    const input = [{ role: 'user', content: '<b>bold</b>' }]
    expect(sanitizeHistory(input)[0].content).toBe('bold')
  })
})

describe('sanitizeColor', () => {
  it('accepts valid hex colors', () => {
    expect(sanitizeColor('#ff0000')).toBe('#ff0000')
    expect(sanitizeColor('#2563eb')).toBe('#2563eb')
  })

  it('returns default for invalid colors', () => {
    expect(sanitizeColor('red')).toBe('#2563eb')
    expect(sanitizeColor('#fff')).toBe('#2563eb') // 3-digit not accepted
    expect(sanitizeColor(null)).toBe('#2563eb')
  })
})
