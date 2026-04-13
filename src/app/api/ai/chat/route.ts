import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  detectIntent,
  detectSentiment,
  detectLanguage,
  shouldEscalate,
  isAgentAvailable,
} from '@/services/ai-engine'
import { getOrBuildPrompt } from '@/services/prompt-builder'
import { tryQuickResponse } from '@/services/quick-responses'
import { getCached, setCached } from '@/services/prompt-cache'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeMessage, sanitizeUUID, sanitizeHistory } from '@/lib/sanitize'
import { sanitizeLLMInput, validateLLMOutput } from '@/lib/llm-guard'
import type { AIContext } from '@/services/ai-engine'
import type { FAQ, Policy } from '@/types/database'

// ── Cached business data loader ─────────────────────
interface BusinessBundle {
  business: Record<string, unknown>
  faqs: FAQ[]
  policies: Policy[]
  templates: Record<string, string>
}

async function loadBusinessData(businessId: string): Promise<BusinessBundle | null> {
  // Check cache first (TTL: 2 minutes)
  const cacheKey = `biz:${businessId}`
  const cached = getCached<BusinessBundle>(cacheKey)
  if (cached) return cached

  const supabase = createAdminClient()

  // Single parallel batch — all 4 queries at once
  const [bizRes, faqRes, polRes, tmpRes] = await Promise.all([
    supabase.rpc('get_business_by_id', { p_id: businessId }),
    supabase.rpc('get_faqs_by_business', { p_business_id: businessId }),
    supabase.rpc('get_policies_by_business', { p_business_id: businessId }),
    supabase.rpc('get_templates_by_business', { p_business_id: businessId }),
  ])

  const business = bizRes.data?.[0]
  if (!business) return null

  const templates: Record<string, string> = {}
  tmpRes.data?.forEach((t: { type: string; content: string }) => { templates[t.type] = t.content })

  const bundle: BusinessBundle = {
    business,
    faqs: faqRes.data || [],
    policies: polRes.data || [],
    templates,
  }

  // Cache for 2 minutes
  setCached(cacheKey, bundle)
  return bundle
}

// ── Conversation history optimizer ──────────────────
function optimizeHistory(
  history: Array<{ role: string; content: string }>,
  intent: string,
): Array<{ role: string; content: string }> {
  // For simple intents, we need minimal history
  if (intent === 'greeting') return history.slice(-2)
  if (intent === 'hours' || intent === 'pricing') return history.slice(-4)

  // For general/complex, keep last 8 (not 20)
  const trimmed = history.slice(-8)

  // Truncate long messages to save tokens
  return trimmed.map(m => ({
    role: m.role,
    content: m.content.length > 800 ? m.content.slice(0, 800) + '...' : m.content,
  }))
}

// ── Dynamic token budget based on intent ────────────
function getTokenBudget(intent: string): number {
  switch (intent) {
    case 'greeting': return 100
    case 'hours': return 180
    case 'pricing': return 250
    case 'shipping': return 250
    default: return 400
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawMessage = body.message
    const rawBusinessId = body.businessId
    const rawConvId = body.conversationId || null
    const rawVisitorId = body.visitorId || null
    const isPlayground = body.isPlayground === true // Playground mode — don't save to DB

    // Sanitize all inputs
    const message = sanitizeMessage(rawMessage)
    const businessId = sanitizeUUID(rawBusinessId)
    const existingConvId = rawConvId ? sanitizeUUID(rawConvId) : null
    const visitorId = typeof rawVisitorId === 'string' ? rawVisitorId.slice(0, 100) : null
    const conversationHistory = sanitizeHistory(body.conversationHistory)

    // Validate sanitized inputs
    if (!message || message.length === 0) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    // Rate limiting — 30 requests per minute per IP+business
    const rlKey = getRateLimitKey(request, 'chat', businessId)
    const rl = checkRateLimit(rlKey, RATE_LIMITS.chat)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'יותר מדי בקשות. נסה שוב בעוד רגע.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    // Already sanitized above
    const safeHistory = conversationHistory

    // ── Load business data (cached) ────────────────────
    const bundle = await loadBusinessData(businessId)
    if (!bundle) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    const { business: businessData, faqs, policies, templates } = bundle

    // ── Check if conversation is already escalated ─────
    if (existingConvId) {
      const supabase = createAdminClient()
      const { data: openEsc } = await supabase
        .from('escalations')
        .select('id, status')
        .eq('conversation_id', existingConvId)
        .in('status', ['open', 'in_progress'])
        .limit(1)

      if (openEsc && openEsc.length > 0) {
        // Conversation is being handled by a human agent — AI should not respond
        return NextResponse.json({
          content: 'השיחה הועברה לנציג שירות. הנציג יענה לך בהקדם.',
          layer: 'transfer',
          intent: 'agent_request',
          sentiment: 'neutral',
          confidence: 1,
          conversationId: existingConvId,
          escalated: true,
        })
      }
    }

    // ── Analysis Layer ──────────────────────────────────
    const intent = detectIntent(message)
    const sentiment = detectSentiment(message)
    const language = detectLanguage(message)
    const conversationLength = safeHistory.length

    // ── Auto-Escalation Check ──────────────────────────
    if (shouldEscalate(sentiment, intent, conversationLength)) {
      const agentStatus = isAgentAvailable(businessData.agent_availability as Record<string, unknown> | null)

      let transferMsg: string
      if (agentStatus.available) {
        transferMsg = language === 'en'
          ? "I'm connecting you with a human agent right now. Someone will be with you shortly!"
          : language === 'ar'
          ? 'جاري تحويلك إلى ممثل خدمة الآن. سيكون معك شخص قريبًا!'
          : templates.transfer || 'מעביר אותך לנציג שירות עכשיו! נציג יהיה איתך בקרוב, אנא המתן רגע.'
      } else {
        transferMsg = language === 'en'
          ? `Our team is currently offline. ${agentStatus.message} We'll get back to you as soon as possible.`
          : `הצוות שלנו לא זמין כרגע. ${agentStatus.message} נחזור אליך בהקדם האפשרי!`
      }

      // Save escalation to DB (skip in playground mode)
      let savedConvId = existingConvId
      if (!isPlayground) {
        const supabase = createAdminClient()
        try {
          if (!savedConvId) {
            const { data: newId } = await supabase.rpc('insert_conversation', {
              p_business_id: businessId, p_channel: 'widget', p_customer: visitorId || 'widget-visitor', p_language: language,
            })
            savedConvId = newId
          }
          if (savedConvId) {
            await supabase.rpc('insert_messages', {
              p_conv_id: savedConvId, p_customer_content: message.slice(0, 2000),
              p_bot_content: transferMsg, p_intent: intent, p_sentiment: sentiment, p_layer: 'transfer',
            })
            await supabase.rpc('insert_escalation', {
              p_conversation_id: savedConvId, p_reason: intent === 'agent_request' ? 'לקוח ביקש נציג' : 'הבוט העביר לנציג',
            })
          }
        } catch (dbErr) { console.error('Chat DB save error:', dbErr) }
      }

      return NextResponse.json({
        content: transferMsg,
        layer: 'transfer',
        conversationId: isPlayground ? null : savedConvId,
        intent,
        sentiment,
        confidence: 1,
      })
    }

    // ── OPTIMIZATION 1: Quick Response (no AI needed) ────
    const quickResponse = tryQuickResponse(
      message,
      language,
      faqs,
      conversationLength,
      (businessData as Record<string, unknown>).name as string,
    )

    if (quickResponse) {
      console.log(`Chat: QUICK response for "${message.substring(0, 30)}" intent=${intent} layer=${quickResponse.layer}`)

      // Save to DB in background (skip in playground mode)
      let savedConvId = existingConvId
      if (!isPlayground) {
        const supabase = createAdminClient()
        try {
          if (!savedConvId) {
            const { data: newId } = await supabase.rpc('insert_conversation', {
              p_business_id: businessId, p_channel: 'widget', p_customer: visitorId || 'widget-visitor', p_language: language,
            })
            savedConvId = newId
          }
          if (savedConvId) {
            await supabase.rpc('insert_messages', {
              p_conv_id: savedConvId, p_customer_content: message.slice(0, 2000),
              p_bot_content: quickResponse.content, p_intent: intent, p_sentiment: sentiment, p_layer: quickResponse.layer,
            })
          }
        } catch (dbErr) { console.error('Chat DB save error:', dbErr) }
      }

      return NextResponse.json({
        content: quickResponse.content,
        layer: quickResponse.layer,
        intent,
        sentiment,
        confidence: quickResponse.confidence,
        conversationId: savedConvId,
      })
    }

    // ── OPTIMIZATION 2: Compact System Prompt ────────────
    const botLanguage = (businessData.contact_info as Record<string, unknown>)?.bot_language as string || 'auto'

    const systemPrompt = getOrBuildPrompt({
      business: businessData as any,
      faqs,
      policies,
      message,
      intent,
      botLanguage,
      isFirstMessage: conversationLength === 0,
    })

    // ── OPTIMIZATION 3: Anti-repeat (compact) ───────────
    let antiRepeat = ''
    if (safeHistory.length > 0) {
      const lastBot = safeHistory
        .filter((m: { role: string }) => m.role === 'assistant')
        .slice(-3)
        .map((m: { content: string }) => m.content.slice(0, 80))

      if (lastBot.length > 0) {
        antiRepeat = `\n\n# חשוב! אל תחזור על תוכן דומה. תשובות קודמות שלך:\n${lastBot.map((m, i) => `${i + 1}. "${m}..."`).join('\n')}\nתתקדם בשיחה, תשאל שאלה חדשה או תן מידע חדש.`
      }
    }

    // ── OPTIMIZATION 4: Trimmed history ─────────────────
    const optimizedHistory = optimizeHistory(safeHistory, intent)

    // Build Gemini contents (sanitize user messages for prompt injection)
    const safeMessage = sanitizeLLMInput(message)
    const geminiContents = []
    for (const m of [...optimizedHistory, { role: 'user', content: safeMessage }]) {
      geminiContents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.role === 'user' ? sanitizeLLMInput(m.content) : m.content }],
      })
    }

    // ── OPTIMIZATION 5: Dynamic token budget ────────────
    const maxTokens = getTokenBudget(intent)

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
    const timeout = setTimeout(() => controller.abort(), 12000) // Reduced from 15s to 12s

    try {
      console.log(`Chat: AI call intent=${intent} tokens=${maxTokens} history=${optimizedHistory.length} prompt=${systemPrompt.length}chars`)

      // Note: Gemini REST API requires key as query param (no Authorization header support)
      // The key is server-side only and never exposed to the client
      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt + antiRepeat }] },
            contents: geminiContents,
            generationConfig: {
              temperature: intent === 'greeting' || intent === 'hours' ? 0.2 : 0.4,
              maxOutputTokens: maxTokens,
              topP: 0.8,
              topK: 30,
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
          content: templates.no_answer || 'מצטער, אירעה שגיאה. אנסה שוב ��אוחר יותר.',
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
      let finalContent = validateLLMOutput(aiContent)
        .replace(/^(תשובה|answer|response)\s*[:：]\s*/i, '')
        .trim()

      // Determine response layer
      const isTransfer = /מעביר.*נציג|connecting.*agent|transfer/i.test(finalContent)
      const layer = isTransfer ? 'transfer' : 'ai'
      const confidence = finalContent.length > 10 && !isTransfer ? 0.85 : 0.5

      // ── Save to DB (skip in playground mode) ──────────
      let savedConvId2 = existingConvId
      if (!isPlayground) {
        const supabase = createAdminClient()
        try {
          if (!savedConvId2) {
            const { data: newId } = await supabase.rpc('insert_conversation', {
              p_business_id: businessId,
              p_channel: 'widget',
              p_customer: visitorId || 'widget-visitor',
              p_language: language,
            })
            savedConvId2 = newId
          }
          if (savedConvId2) {
            await supabase.rpc('insert_messages', {
              p_conv_id: savedConvId2,
              p_customer_content: message.slice(0, 2000),
              p_bot_content: finalContent,
              p_intent: intent,
              p_sentiment: sentiment,
              p_layer: layer,
            })
            if (isTransfer) {
              await supabase.rpc('insert_escalation', {
                p_conversation_id: savedConvId2,
                p_reason: 'לקוח ביקש נציג דרך הווידג׳ט',
              })
            }
          }
        } catch (dbErr) {
          console.error('Chat DB save error:', dbErr)
        }
      }

      // Log token usage from Gemini metadata
      const usageMeta = aiData.usageMetadata
      if (usageMeta) {
        console.log(`Chat: Gemini tokens — prompt:${usageMeta.promptTokenCount} response:${usageMeta.candidatesTokenCount} total:${usageMeta.totalTokenCount}`)
      }

      return NextResponse.json({
        content: finalContent,
        layer,
        intent,
        sentiment,
        confidence,
        conversationId: savedConvId2,
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
