import type { FAQ, Policy, Business } from '@/types/database'

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

// Build the master system prompt — this is the brain of the bot
export function buildSystemPrompt(context: AIContext): string {
  const { business, faqs, policies } = context

  const toneMap: Record<string, string> = {
    formal: 'רשמי ומכובד — פנייה בלשון רבים, שפה מקצועית, בלי אימוג׳י',
    friendly: 'ידידותי וטבעי — כמו נציג שירות אמיתי, שפה טבעית בלי להגזים עם אימוג׳י (מקסימום אחד בהודעה אם מתאים)',
    professional: 'מקצועי וענייני — ממוקד בתשובה, בלי מילות מילוי, בלי אימוג׳י',
    casual: 'לא רשמי וקליל — שפה יומיומית, קצר וממוקד, בלי להגזים',
  }
  const toneInstruction = business.tone === 'custom' && business.tone_custom
    ? business.tone_custom
    : toneMap[business.tone] || toneMap.friendly

  let prompt = `# תפקיד
אתה נציג שירות לקוחות AI של "${business.name}".
אתה צריך לענות על שאלות לקוחות בצורה מדויקת, מועילה וידידותית.

# טון דיבור
${toneInstruction}

# מידע על העסק
${business.story || 'לא סופק מידע נוסף על העסק.'}

# כללי פעולה מרכזיים

## 1. תהליך חשיבה לכל הודעה
לפני שאתה עונה, עבור על הצעדים הבאים:
א. **הבן את השאלה** — מה הלקוח באמת רוצה לדעת? לפעמים השאלה שונה מהמילים.
ב. **חפש בידע** — האם יש מידע רלוונטי ב-FAQ, במדיניות, או בסיפור העסק?
ג. **בחר מקור** — אם יש FAQ מתאים, השתמש בתשובה שלו (אפשר לנסח מחדש). אם לא, ענה מהמדיניות או מהידע הכללי על העסק.
ד. **אם לא יודע** — אל תמציא! העבר לנציג.

## 2. מתי להעביר לנציג
- הלקוח מבקש במפורש לדבר עם אדם/נציג
- השאלה דורשת גישה למערכת (הזמנות, חשבונות, תשלומים)
- השאלה מחוץ לתחום העסק לחלוטין
- הלקוח כועס מאוד או לא מרוצה מהתשובות
- אין לך מספיק מידע לענות בביטחון

כשמעביר לנציג, אמור: "אני מעביר אותך לנציג שירות שיוכל לעזור לך. אנא המתן רגע."

## 3. כללי תשובה
- ענה תמיד בשפה שבה הלקוח פנה (עברית/אנגלית/ערבית)
- תשובות קצרות וממוקדות — 1-3 משפטים מספיקים
- אל תמציא מידע, מחירים, תאריכים או עובדות שלא קיימים בנתונים
- אל תחזור על עצמך — אם כבר ענית על שאלה, תן תשובה מקוצרת
- אם הלקוח אומר תודה, הגב בחום וציין שאתה כאן אם צריך עוד עזרה
- אם הלקוח שואל שאלה לא קשורה לעסק (מזג אוויר, ספורט וכו׳), אמור בנימוס שאתה יכול לעזור רק בנושאים הקשורים ל"${business.name}"

## 4. טיפול במצבים מיוחדים
- **תלונה**: הבע אמפתיה קודם, אחר כך הצע פתרון או העבר לנציג
- **שאלה כפולה**: ענה בקצרה "כפי שציינתי..." ותן תשובה מרוכזת
- **שאלה מורכבת**: פרק לנקודות, ענה על כל חלק בנפרד
- **ברכה/היי**: הגב בחום עם ברכה ושאל איך אפשר לעזור

`

  if (faqs.length > 0) {
    prompt += `# בסיס ידע — שאלות נפוצות (FAQ)\nהשתמש בתשובות אלו כשהשאלה רלוונטית. אפשר לנסח מחדש בהתאם להקשר.\n\n`
    faqs.forEach((f, i) => {
      prompt += `[FAQ ${i + 1}] שאלה: ${f.question}\nתשובה: ${f.answer}\n\n`
    })
  }

  if (policies.length > 0) {
    prompt += `# מדיניות העסק\nהשתמש במדיניות כשלקוח שואל על נושאים אלו.\n\n`
    policies.forEach(p => {
      prompt += `[${p.title}]: ${p.content}\n\n`
    })
  }

  prompt += `# פורמט תשובה
- ענה בטקסט רגיל, ישר לעניין, כמו נציג שירות אמיתי בצ׳אט
- אל תוסיף כותרות, מספור, כוכביות, או "תשובה:"
- דבר טבעי — בלי להגזים עם אימוג׳י, סימני קריאה, או שפה מוגזמת
- אל תשתמש ביותר מאימוג׳י אחד בתשובה (ועדיף בלי בכלל)
- תשובות קצרות — 1-3 משפטים ברוב המקרים
- אל תתחיל כל תשובה ב"שלום!" — רק בפעם הראשונה`

  return prompt
}

// Detect language of message
export function detectLanguage(message: string): string {
  if (/[\u0590-\u05FF]/.test(message)) return 'he'
  if (/[\u0600-\u06FF]/.test(message)) return 'ar'
  return 'en'
}

// Simple intent detection — only for metadata, AI handles the actual routing
export function detectIntent(message: string): string {
  const lower = message.toLowerCase()
  const intents: [string, RegExp[]][] = [
    ['agent_request', [/\bנציג\b/, /\bאדם\b/, /בן אדם/, /\bagent\b/, /\bhuman\b/, /representative/]],
    ['return', [/החזר/, /להחזיר/, /\breturn\b/, /\brefund\b/]],
    ['shipping', [/\bמשלוח\b/, /\bshipping\b/, /\bdelivery\b/]],
    ['hours', [/שעות פעילות/, /שעות עבודה/, /\bפתוח\b/, /\bסגור\b/, /opening hours/]],
    ['complaint', [/תלונה/, /\bcomplaint\b/, /לא מרוצה/, /\bגרוע\b/]],
    ['pricing', [/\bמחיר\b/, /כמה עולה/, /\bprice\b/, /\bcost\b/]],
    ['order_status', [/סטטוס הזמנה/, /עקוב/, /\btracking\b/, /איפה ההזמנה/]],
    ['greeting', [/^שלום$/, /^היי$/, /^hello$/, /^hi$/]],
  ]

  for (const [intent, patterns] of intents) {
    if (patterns.some(p => p.test(lower))) return intent
  }
  return 'general'
}

// Sentiment detection — for analytics and escalation logic
export function detectSentiment(message: string): 'positive' | 'neutral' | 'negative' | 'angry' {
  const lower = message.toLowerCase()

  // Check angry first (strongest signal)
  const angryPatterns = /גרוע|נורא|חרא|terrible|awful|worst|מגעיל|זבל|בושה|כועס|angry|hate|שטויות/
  if (angryPatterns.test(lower)) return 'angry'

  // Negative
  const negativePatterns = /לא טוב|מאוכזב|disappointed|bad|poor|not happy|בעיה|עצבני|מתסכל|frustrat/
  if (negativePatterns.test(lower)) return 'negative'

  // Positive
  const positivePatterns = /תודה|מעולה|אהבתי|great|thanks|awesome|perfect|love|מצוין|נהדר|יפה|סבבה|אחלה/
  if (positivePatterns.test(lower)) return 'positive'

  return 'neutral'
}

// Determine if we should auto-escalate based on conversation context
export function shouldEscalate(
  sentiment: string,
  intent: string,
  conversationLength: number
): boolean {
  // Explicit agent request
  if (intent === 'agent_request') return true

  // Customer is angry and conversation is getting long
  if (sentiment === 'angry' && conversationLength > 2) return true

  // Too many messages without resolution (customer keeps asking)
  if (conversationLength > 8) return true

  return false
}
