import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

// Hardcoded server-side — NEVER accept system prompts from client
const LANDING_SYSTEM_PROMPT = `אתה הבוט של BotPress AI — פלטפורמה לשירות לקוחות חכם לעסקים בישראל.
מידע: BotPress AI מאפשר ליצור בוט AI לוואטסאפ, אימייל וצ'אט. סורק אתרים אוטומטית, 3 שכבות מענה (FAQ/AI/נציג), תמיכה בעברית/אנגלית/ערבית, הקמה ב-3 דקות.
תוכניות: ניסיון ₪1, בסיסי ₪99/חודש, פרימיום ₪299/חודש.
כללים: ענה בעברית, קצר, ידידותי, מקצועי. אל תענה על נושאים שלא קשורים לפלטפורמה.`

export async function POST(request: NextRequest) {
  // Rate limit: 15 req/min per IP — prevent abuse on public endpoint
  const rlKey = getRateLimitKey(request, 'landing-chat')
  const rl = checkRateLimit(rlKey, { limit: 15, windowMs: 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests', retryAfter: rl.retryAfter }, { status: 429 })
  }

  try {
    const { message, history } = await request.json() // systemContext intentionally NOT accepted from client

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Truncate to prevent abuse
    const cleanMessage = message.slice(0, 500)
    const cleanHistory = (history || []).slice(-8)

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ content: 'הבוט לא זמין כרגע. נסה מאוחר יותר.' })
    }

    const contents = [
      ...cleanHistory.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: cleanMessage }] },
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: LANDING_SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    )

    const data = await res.json()
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'סליחה, לא הצלחתי לענות.'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Landing chat error:', error)
    return NextResponse.json({ content: 'אירעה שגיאה. נסה שוב.' })
  }
}
