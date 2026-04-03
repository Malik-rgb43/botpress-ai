import type { FAQ, Policy, Business, ResponseTemplate } from '@/types/database'

export interface AIContext {
  business: Business
  faqs: FAQ[]
  policies: Policy[]
  templates: Record<string, string>
  conversationHistory: { role: string; content: string }[]
  customerLanguage?: string
}

export interface AIResponse {
  content: string
  layer: 'faq' | 'ai' | 'transfer'
  intent: string | null
  sentiment: 'positive' | 'neutral' | 'negative' | 'angry' | null
  confidence: number
}

// Layer 0: Intent Detection
export function detectIntent(message: string): string {
  const lower = message.toLowerCase()
  const intents: [string, RegExp[]][] = [
    ['agent_request', [/נציג/, /אדם/, /בן.אדם/, /agent/, /human/, /representative/]],
    ['return', [/החזר/, /להחזיר/, /return/, /refund/]],
    ['shipping', [/משלוח/, /shipping/, /delivery/, /הגעה/]],
    ['hours', [/שעות/, /פתוח/, /סגור/, /hours/, /open/, /close/]],
    ['complaint', [/תלונה/, /complaint/, /בעיה/, /problem/, /לא מרוצה/, /גרוע/]],
    ['pricing', [/מחיר/, /עלות/, /כמה עולה/, /price/, /cost/]],
    ['order_status', [/הזמנה/, /סטטוס/, /order/, /status/, /tracking/]],
    ['greeting', [/שלום/, /היי/, /hello/, /hi/, /hey/]],
  ]

  for (const [intent, patterns] of intents) {
    if (patterns.some(p => p.test(lower))) return intent
  }
  return 'general'
}

// Layer 0: Sentiment Detection
export function detectSentiment(message: string): 'positive' | 'neutral' | 'negative' | 'angry' {
  const lower = message.toLowerCase()
  if (/תודה|מעולה|אהבתי|great|thanks|awesome|perfect|love/.test(lower)) return 'positive'
  if (/גרוע|נורא|חרא|terrible|awful|worst|hate|angry|כועס/.test(lower)) return 'angry'
  if (/לא טוב|מאוכזב|disappointed|bad|poor|not happy|בעיה/.test(lower)) return 'negative'
  return 'neutral'
}

// Layer 1: FAQ Match
export function findFAQMatch(message: string, faqs: FAQ[]): { faq: FAQ; score: number } | null {
  if (faqs.length === 0) return null

  const lower = message.toLowerCase()
  let bestMatch: { faq: FAQ; score: number } | null = null

  for (const faq of faqs) {
    const qLower = faq.question.toLowerCase()
    const words = qLower.split(/\s+/).filter(w => w.length > 2)
    const messageWords = lower.split(/\s+/)

    let matchCount = 0
    for (const word of words) {
      if (messageWords.some(mw => mw.includes(word) || word.includes(mw))) {
        matchCount++
      }
    }

    const score = words.length > 0 ? matchCount / words.length : 0
    if (score > 0.5 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { faq, score }
    }
  }

  return bestMatch
}

// Build system prompt for Layer 2
export function buildSystemPrompt(context: AIContext): string {
  const { business, faqs, policies } = context
  const toneMap: Record<string, string> = {
    formal: 'דבר בצורה רשמית ומכובדת',
    friendly: 'דבר בצורה ידידותית וחמה',
    professional: 'דבר בצורה מקצועית וענינית',
    casual: 'דבר בצורה לא רשמית וקלילה',
  }
  const toneInstruction = business.tone === 'custom' && business.tone_custom
    ? business.tone_custom
    : toneMap[business.tone] || toneMap.friendly

  let prompt = `אתה בוט שירות לקוחות של "${business.name}".
${toneInstruction}

מידע על העסק:
${business.story || 'לא סופק מידע נוסף'}

`

  if (faqs.length > 0) {
    prompt += `שאלות נפוצות:\n`
    faqs.forEach(f => {
      prompt += `ש: ${f.question}\nת: ${f.answer}\n\n`
    })
  }

  if (policies.length > 0) {
    prompt += `מדיניות העסק:\n`
    policies.forEach(p => {
      prompt += `${p.title}: ${p.content}\n\n`
    })
  }

  prompt += `\nהנחיות:
- ענה רק על בסיס המידע שיש לך על העסק
- אם אתה לא בטוח בתשובה, אמור שאתה מעביר לנציג
- אם הלקוח מבקש נציג, העבר מיד
- ענה בשפה שבה הלקוח פנה
- תשובות קצרות וממוקדות`

  return prompt
}
