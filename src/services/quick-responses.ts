/**
 * Quick Response Engine — handles simple messages WITHOUT calling Gemini
 *
 * Saves API calls for:
 * 1. Greetings ("היי", "שלום", "hello")
 * 2. Thank you ("תודה", "thanks")
 * 3. Goodbye ("להתראות", "ביי")
 * 4. Direct FAQ matches (high confidence keyword matching)
 *
 * Returns null if the message needs AI processing
 */

import type { FAQ } from '@/types/database'
import { matchFAQ } from './faq-matcher'

interface QuickResponse {
  content: string
  layer: 'faq' | 'ai'
  confidence: number
  skipAI: true
}

// Greeting patterns
const GREETING_PATTERNS = [
  /^(שלום|היי|הי|הלו|בוקר טוב|ערב טוב|צהריים טובים)[\s!.]*$/i,
  /^(hello|hi|hey|good morning|good evening)[\s!.]*$/i,
  /^(مرحبا|مساء الخير|صباح الخير)[\s!.]*$/i,
]

const GREETING_RESPONSES_HE = [
  'היי! במה אוכל לעזור לך?',
  'שלום! מה מחפש/ת היום?',
  'היי! אשמח לעזור, ספר/י לי מה צריך',
]

const GREETING_RESPONSES_EN = [
  'Hi! How can I help you?',
  'Hello! What can I help you with?',
  'Hey! How can I assist you today?',
]

// Thank you patterns
const THANKS_PATTERNS = [
  /^(תודה|תודה רבה|מעולה תודה|אחלה תודה|סבבה תודה|יופי תודה)[\s!.]*$/i,
  /^(thanks|thank you|thx|ty|thank u)[\s!.]*$/i,
]

const THANKS_RESPONSES_HE = [
  'בשמחה! יום נעים 😊',
  'בכיף! אם תצטרך עוד משהו, אני כאן.',
  'שמח שעזרתי! יום טוב!',
]

const THANKS_RESPONSES_EN = [
  'You\'re welcome! Have a great day!',
  'Happy to help! Let me know if you need anything else.',
  'Glad I could help! Have a good one!',
]

// Goodbye patterns
const BYE_PATTERNS = [
  /^(ביי|להתראות|יום טוב|שלום|לילה טוב|סגור|זהו|לא צריך|אין צורך)[\s!.]*$/i,
  /^(bye|goodbye|good night|that's all|no thanks|nope)[\s!.]*$/i,
]

const BYE_RESPONSES_HE = [
  'יום נעים! 👋',
  'להתראות, תמיד כאן אם צריך!',
  'יום טוב! אשמח לעזור שוב בכל עת.',
]

const BYE_RESPONSES_EN = [
  'Goodbye! Have a great day! 👋',
  'Take care! I\'m here whenever you need.',
]

// Simple confirmations
const CONFIRM_PATTERNS = [
  /^(אוקי|בסדר|הבנתי|סבבה|יופי|טוב|אחלה|קול|מצוין|נהדר|okay|ok|got it|great|perfect)[\s!.]*$/i,
]

const CONFIRM_RESPONSES_HE = [
  'מעולה! אם תצטרך עוד משהו, אני כאן.',
  'סבבה! יש עוד משהו?',
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Try to generate a quick response without AI
 * Returns null if AI is needed
 */
export function tryQuickResponse(
  message: string,
  language: string,
  faqs: FAQ[],
  conversationLength: number,
  businessName: string,
): QuickResponse | null {
  const trimmed = message.trim()

  // 1. Greeting (only for first message or very start of conversation)
  if (conversationLength <= 1 && GREETING_PATTERNS.some(p => p.test(trimmed))) {
    return {
      content: language === 'en'
        ? pickRandom(GREETING_RESPONSES_EN)
        : pickRandom(GREETING_RESPONSES_HE),
      layer: 'ai',
      confidence: 1,
      skipAI: true,
    }
  }

  // 2. Thank you
  if (THANKS_PATTERNS.some(p => p.test(trimmed))) {
    return {
      content: language === 'en'
        ? pickRandom(THANKS_RESPONSES_EN)
        : pickRandom(THANKS_RESPONSES_HE),
      layer: 'ai',
      confidence: 1,
      skipAI: true,
    }
  }

  // 3. Goodbye
  if (BYE_PATTERNS.some(p => p.test(trimmed))) {
    return {
      content: language === 'en'
        ? pickRandom(BYE_RESPONSES_EN)
        : pickRandom(BYE_RESPONSES_HE),
      layer: 'ai',
      confidence: 1,
      skipAI: true,
    }
  }

  // 4. Simple confirmation (only mid-conversation)
  if (conversationLength > 0 && CONFIRM_PATTERNS.some(p => p.test(trimmed))) {
    return {
      content: language === 'en'
        ? 'Great! Let me know if you need anything else.'
        : pickRandom(CONFIRM_RESPONSES_HE),
      layer: 'ai',
      confidence: 0.9,
      skipAI: true,
    }
  }

  // 5. Direct FAQ match
  const faqMatch = matchFAQ(message, faqs)
  if (faqMatch && faqMatch.score >= 0.7) {
    // High confidence FAQ match — use the answer directly
    return {
      content: faqMatch.faq.answer,
      layer: 'faq',
      confidence: faqMatch.score,
      skipAI: true,
    }
  }

  // No quick response possible — needs AI
  return null
}
