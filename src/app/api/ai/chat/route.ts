import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectIntent, detectSentiment, findFAQMatch, buildSystemPrompt } from '@/services/ai-engine'
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

    // Validate conversation history
    const safeHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-20).filter(
          (m: { role?: string; content?: string }) =>
            m && typeof m.content === 'string' &&
            (m.role === 'user' || m.role === 'assistant') &&
            m.content.length <= 2000
        )
      : []

    const supabase = await createClient()

    // Load business data
    const [bizRes, faqRes, polRes, tmpRes] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', businessId).single(),
      supabase.from('faqs').select('*').eq('business_id', businessId).order('order'),
      supabase.from('policies').select('*').eq('business_id', businessId),
      supabase.from('response_templates').select('*').eq('business_id', businessId),
    ])

    if (!bizRes.data) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const templates: Record<string, string> = {}
    tmpRes.data?.forEach(t => { templates[t.type] = t.content })

    // Layer 0: Intent + Sentiment
    const intent = detectIntent(message)
    const sentiment = detectSentiment(message)

    // Direct agent request
    if (intent === 'agent_request') {
      return NextResponse.json({
        content: templates.transfer || 'מעביר אותך לנציג שירות.',
        layer: 'transfer',
        intent,
        sentiment,
        confidence: 1,
      })
    }

    // Layer 1: FAQ Match
    const faqMatch = findFAQMatch(message, faqRes.data || [])
    if (faqMatch && faqMatch.score > 0.6) {
      return NextResponse.json({
        content: faqMatch.faq.answer,
        layer: 'faq',
        intent,
        sentiment,
        confidence: faqMatch.score,
      })
    }

    // Layer 2: AI Generated Response
    const context: AIContext = {
      business: bizRes.data,
      faqs: faqRes.data || [],
      policies: polRes.data || [],
      templates,
      conversationHistory: safeHistory,
    }

    const systemPrompt = buildSystemPrompt(context)

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...safeHistory.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Call Gemini AI
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        content: templates.no_answer || 'מצטער, לא הצלחתי למצוא תשובה. אעביר אותך לנציג.',
        layer: 'transfer',
        intent,
        sentiment,
        confidence: 0,
      })
    }

    // Convert messages to Gemini format
    const geminiContents = []

    // System instruction is separate in Gemini
    const systemInstruction = systemPrompt

    // Add conversation history + current message
    for (const m of [...safeHistory, { role: 'user', content: message }]) {
      geminiContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    clearTimeout(timeout)

    if (!aiRes.ok) {
      console.error('Gemini API error:', aiRes.status, await aiRes.text().catch(() => ''))
      return NextResponse.json({
        content: templates.no_answer || 'מצטער, אירעה שגיאה. אעביר אותך לנציג.',
        layer: 'transfer',
        intent,
        sentiment,
        confidence: 0,
      })
    }

    const aiData = await aiRes.json()
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiContent) {
      return NextResponse.json({
        content: templates.transfer || 'מעביר אותך לנציג.',
        layer: 'transfer',
        intent,
        sentiment,
        confidence: 0,
      })
    }

    return NextResponse.json({
      content: aiContent,
      layer: 'ai',
      intent,
      sentiment,
      confidence: 0.8,
    })

  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
