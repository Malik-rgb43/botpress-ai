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

// Hebrew/English stopwords to ignore in FAQ matching
const STOPWORDS = new Set([
  // Hebrew
  'את', 'של', 'על', 'עם', 'מה', 'איך', 'כמה', 'זה', 'היא', 'הוא',
  'אני', 'לי', 'שלי', 'אתם', 'הם', 'יש', 'אין', 'גם', 'רק', 'כל',
  'לא', 'כן', 'או', 'אם', 'עוד', 'כבר', 'היה', 'הזה', 'הזאת', 'אותו',
  'אותה', 'שאני', 'רוצה', 'צריך', 'יכול', 'אפשר', 'בבקשה', 'תודה',
  'שלום', 'היי', 'לשאול', 'להגיד', 'לדעת',
  // English
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
  'in', 'to', 'for', 'of', 'with', 'how', 'what', 'when', 'where',
  'can', 'do', 'does', 'your', 'you', 'my', 'this', 'that',
])

// Layer 1: FAQ Match — improved with stopword filtering and stricter scoring
export function findFAQMatch(message: string, faqs: FAQ[]): { faq: FAQ; score: number } | null {
  if (faqs.length === 0) return null

  const lower = message.toLowerCase()
  const messageWords = lower.split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w))

  // If after removing stopwords there are no meaningful words, skip FAQ match
  if (messageWords.length === 0) return null

  let bestMatch: { faq: FAQ; score: number } | null = null

  for (const faq of faqs) {
    const qLower = faq.question.toLowerCase()
    const faqWords = qLower.split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w))

    if (faqWords.length === 0) continue

    let matchCount = 0
    for (const faqWord of faqWords) {
      // Require exact word match or very close match (not substring)
      if (messageWords.some(mw => mw === faqWord || (mw.length > 4 && faqWord.length > 4 && (mw.startsWith(faqWord) || faqWord.startsWith(mw))))) {
        matchCount++
      }
    }

    // Score based on matched FAQ words AND coverage of message words
    const faqCoverage = faqWords.length > 0 ? matchCount / faqWords.length : 0
    const msgCoverage = messageWords.length > 0 ? matchCount / messageWords.length : 0
    const score = (faqCoverage + msgCoverage) / 2 // Average of both directions

    // Higher threshold: 0.7 for confident FAQ match
    if (score > 0.7 && matchCount >= 2 && (!bestMatch || score > bestMatch.score)) {
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

  prompt += `\nהנחיות חשובות:
- קרא היטב את שאלת הלקוח והבן מה הוא באמת שואל לפני שאתה עונה
- השתמש בשאלות הנפוצות ובמדיניות רק כשהן באמת רלוונטיות לשאלה
- אם השאלה לא קשורה לאף FAQ או מדיניות, ענה על בסיס הידע הכללי שלך על העסק
- אם אתה לא בטוח בתשובה או שהשאלה מחוץ לתחום העסק, אמור שאתה מעביר לנציג
- ענה בשפה שבה הלקוח פנה (עברית, אנגלית, או ערבית)
- תשובות קצרות, ממוקדות וידידותיות
- אל תמציא מידע שלא קיים בנתונים שקיבלת
- אל תענה על שאלות שלא קשורות לעסק`

  return prompt
}
