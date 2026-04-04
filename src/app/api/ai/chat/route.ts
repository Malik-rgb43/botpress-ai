import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  detectIntent,
  detectSentiment,
  detectLanguage,
  buildSystemPrompt,
  shouldEscalate,
} from '@/services/ai-engine'
import type { AIContext } from '@/services/ai-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, businessId, conversationHistory = [] } = body

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }
    if (!businessId || typeof businessId !== 'string') {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    // Validate and sanitize conversation history
    const safeHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-20).filter(
          (m: { role?: string; content?: string }) =>
            m && typeof m.content === 'string' &&
            (m.role === 'user' || m.role === 'assistant') &&
            m.content.length <= 2000
        )
      : []

    const supabase = createAdminClient()

    // Load business data via RPC (bypasses RLS for widget/public access)
    const [bizRes, faqRes, polRes, tmpRes] = await Promise.all([
      supabase.rpc('get_business_by_id', { p_id: businessId }),
      supabase.rpc('get_faqs_by_business', { p_business_id: businessId }),
      supabase.rpc('get_policies_by_business', { p_business_id: businessId }),
      supabase.rpc('get_templates_by_business', { p_business_id: businessId }),
    ])

    const businessData = bizRes.data?.[0]
    if (!businessData) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const templates: Record<string, string> = {}
    tmpRes.data?.forEach(t => { templates[t.type] = t.content })

    // ── Analysis Layer ──────────────────────────────────
    const intent = detectIntent(message)
    const sentiment = detectSentiment(message)
    const language = detectLanguage(message)
    const conversationLength = safeHistory.length

    // ── Auto-Escalation Check ──────────────────────────
    if (shouldEscalate(sentiment, intent, conversationLength)) {
      const transferMsg = language === 'en'
        ? "I'm connecting you with a human agent. Please hold on."
        : language === 'ar'
        ? 'أنا أحولك إلى ممثل خدمة. يرجى الانتظار.'
        : templates.transfer || 'מעביר אותך לנציג שירות. אנא המתן רגע.'

      return NextResponse.json({
        content: transferMsg,
        layer: 'transfer',
        intent,
        sentiment,
        confidence: 1,
      })
    }

    // ── Build AI Context ────────────────────────────────
    const context: AIContext = {
      business: businessData,
      faqs: faqRes.data || [],
      policies: polRes.data || [],
      templates,
      conversationHistory: safeHistory,
      customerLanguage: language,
    }

    const systemPrompt = buildSystemPrompt(context)

    // ── Build Gemini Request ────────────────────────────
    // Add anti-repeat instruction if there's conversation history
    let antiRepeatInstruction = ''
    if (safeHistory.length > 0) {
      // Get last bot response to prevent repetition
      const lastBotMessages = safeHistory
        .filter((m: { role: string }) => m.role === 'assistant')
        .slice(-3)
        .map((m: { content: string }) => m.content)

      if (lastBotMessages.length > 0) {
        antiRepeatInstruction = `\n\n# חשוב — אל תחזור על עצמך!
התשובות האחרונות שנתת:
${lastBotMessages.map((m: string, i: number) => `${i + 1}. "${m.slice(0, 100)}..."`).join('\n')}

אם הלקוח שואל את אותה שאלה שוב, ענה בקצרה "כפי שציינתי..." ותן תשובה מתומצתת אחרת.
אם הלקוח שואל שאלה חדשה, ענה כרגיל.`
      }
    }

    const fullSystemPrompt = systemPrompt + antiRepeatInstruction

    // Build Gemini contents array
    const geminiContents = []
    for (const m of [...safeHistory, { role: 'user', content: message }]) {
      geminiContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })
    }

    // ── Call Gemini ─────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        content: templates.no_answer || 'מצטער, המערכת לא מוגדרת. אנא פנה אלינו ישירות.',
        layer: 'transfer',
        intent,
        sentiment,
        confidence: 0,
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: fullSystemPrompt }] },
            contents: geminiContents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 400,
              topP: 0.8,
              topK: 40,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
          }),
        }
      )

      clearTimeout(timeout)

      if (!aiRes.ok) {
        const errorText = await aiRes.text().catch(() => '')
        console.error('Gemini API error:', aiRes.status, errorText)
        return NextResponse.json({
          content: templates.no_answer || 'מצטער, אירעה שגיאה. אנסה שוב מאוחר יותר.',
          layer: 'transfer',
          intent,
          sentiment,
          confidence: 0,
        })
      }

      const aiData = await aiRes.json()

      // Check if response was blocked by safety
      if (aiData.candidates?.[0]?.finishReason === 'SAFETY') {
        return NextResponse.json({
          content: 'מצטער, לא הצלחתי לעבד את ההודעה. אפשר לנסח אחרת?',
          layer: 'ai',
          intent,
          sentiment,
          confidence: 0.5,
        })
      }

      const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiContent || aiContent.trim().length === 0) {
        return NextResponse.json({
          content: templates.transfer || 'מעביר אותך לנציג שירות.',
          layer: 'transfer',
          intent,
          sentiment,
          confidence: 0,
        })
      }

      // ── Post-process Response ──────────────────────────
      let finalContent = aiContent.trim()

      // Remove any "תשובה:" or "Response:" prefixes the model might add
      finalContent = finalContent
        .replace(/^(תשובה|answer|response)\s*[:：]\s*/i, '')
        .trim()

      // Determine response layer based on content analysis
      const isTransfer = /מעביר.*נציג|connecting.*agent|transfer/i.test(finalContent)
      const layer = isTransfer ? 'transfer' : 'ai'

      // Calculate confidence based on response quality
      const confidence = finalContent.length > 10 && !isTransfer ? 0.85 : 0.5

      return NextResponse.json({
        content: finalContent,
        layer,
        intent,
        sentiment,
        confidence,
      })

    } catch (fetchError) {
      clearTimeout(timeout)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Gemini request timed out')
        return NextResponse.json({
          content: 'מצטער, התגובה לקחה יותר מדי זמן. אנא נסה שוב.',
          layer: 'ai',
          intent,
          sentiment,
          confidence: 0,
        })
      }

      throw fetchError
    }

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
