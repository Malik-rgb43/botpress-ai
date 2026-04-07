/**
 * LLM Prompt Injection Guard
 * Strips common injection patterns from user input before sending to AI
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /ignore\s+(all\s+)?above/gi,
  /disregard\s+(all\s+)?previous/gi,
  /forget\s+(all\s+)?previous/gi,
  /you\s+are\s+now\s+/gi,
  /pretend\s+you\s+are/gi,
  /act\s+as\s+(a\s+)?/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<<SYS>>/gi,
  /<<\/SYS>>/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /\bDAN\b/g,
  /jailbreak/gi,
  /bypass\s+(your\s+)?(rules|restrictions|guidelines)/gi,
  /reveal\s+(your\s+)?(system\s+)?prompt/gi,
  /what\s+are\s+your\s+(system\s+)?instructions/gi,
  /output\s+your\s+(system\s+)?prompt/gi,
]

export function sanitizeLLMInput(input: string): string {
  let sanitized = input
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[filtered]')
  }
  return sanitized.trim()
}

export function validateLLMOutput(output: string): string {
  // Strip any leaked system prompt indicators
  let cleaned = output
    .replace(/system\s*prompt\s*:/gi, '')
    .replace(/\[INST\][\s\S]*?\[\/INST\]/g, '')
    .replace(/<\|im_start\|>[\s\S]*?<\|im_end\|>/g, '')

  // Ensure no URLs that look like phishing
  cleaned = cleaned.replace(/https?:\/\/(?!botpress-ai\.vercel\.app)[^\s]*\.(exe|bat|cmd|ps1|sh|php)\b/gi, '[link removed]')

  return cleaned.trim()
}
