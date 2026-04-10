import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { detectIntent, detectSentiment, detectLanguage } from '@/services/ai-engine'
import { getOrBuildPrompt } from '@/services/prompt-builder'
import { sanitizeMessage } from '@/lib/sanitize'
import { sanitizeLLMInput, validateLLMOutput } from '@/lib/llm-guard'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
if (!VERIFY_TOKEN) {
  console.warn('WHATSAPP_VERIFY_TOKEN not set — WhatsApp webhook will reject all verification requests')
}

// WhatsApp Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && VERIFY_TOKEN && token) {
    // Constant-time comparison to prevent timing attacks
    const crypto = await import('crypto')
    const tokenBuf = Buffer.from(token)
    const expectedBuf = Buffer.from(VERIFY_TOKEN)
    if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      console.log('WhatsApp webhook verified')
      return new NextResponse(challenge, { status: 200 })
    }
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// WhatsApp Incoming Message (POST)
export async function POST(request: NextRequest) {
  try {
    // Verify Meta webhook signature
    const signature = request.headers.get('x-hub-signature-256')
    const rawBody = await request.text()
    const appSecret = process.env.WHATSAPP_APP_SECRET
    if (!appSecret) {
      console.warn('WHATSAPP_APP_SECRET not configured — webhook signature verification SKIPPED. Set this env var in production!')
    }
    if (appSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 403 })
      }
      const crypto = await import('crypto')
      const expectedSig = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
      // Constant-time comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature)
      const expectedBuffer = Buffer.from(expectedSig)
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }
    const body = JSON.parse(rawBody)

    // Extract message from WhatsApp webhook payload
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    // Only process messages (not status updates)
    if (!value?.messages || value.messages.length === 0) {
      return NextResponse.json({ status: 'no message' })
    }

    const message = value.messages[0]
    const from = message.from // Customer phone number
    const rawMessageText = message.text?.body // Message text
    const phoneNumberId = value.metadata?.phone_number_id

    if (!rawMessageText || !from) {
      return NextResponse.json({ status: 'no text' })
    }

    // Sanitize message input
    const msgBody = sanitizeMessage(rawMessageText, 3000)
    if (!msgBody) {
      return NextResponse.json({ status: 'empty message' })
    }

    console.log(`WhatsApp message from ${from}: ${msgBody.substring(0, 50)}`)

    const supabase = createAdminClient()

    // Find business by WhatsApp phone number ID — indexed JSONB query instead of scanning all
    const { data: bizByPhone } = await supabase
      .from('businesses')
      .select('*')
      .eq('contact_info->>whatsapp_phone_id', phoneNumberId)
      .limit(1)
    const business = bizByPhone?.[0] || null

    if (!business) {
      console.log('No business found for WhatsApp phone:', phoneNumberId)
      return NextResponse.json({ status: 'no business' })
    }
    const biz = business

    // Load business data
    const [faqRes, polRes, tmpRes] = await Promise.all([
      supabase.from('faqs').select('*').eq('business_id', biz.id).order('order'),
      supabase.from('policies').select('*').eq('business_id', biz.id),
      supabase.from('response_templates').select('*').eq('business_id', biz.id),
    ])
    const templates: Record<string, string> = {}
    tmpRes.data?.forEach((t: { type: string; content: string }) => { templates[t.type] = t.content })

    // Check if this customer already has an escalated conversation
    const { data: existingEsc } = await supabase
      .from('conversations')
      .select('id, escalations!inner(id, status)')
      .eq('business_id', biz.id)
      .eq('customer', from)
      .eq('channel', 'whatsapp')
      .in('escalations.status', ['open', 'in_progress'])
      .limit(1)

    if (existingEsc && existingEsc.length > 0) {
      // Don't let AI respond — agent is handling this conversation
      await sendWhatsAppMessage(phoneNumberId, from, templates.transfer || 'השיחה שלך מטופלת על ידי נציג. הנציג יחזור אליך בהקדם.')
      return NextResponse.json({ status: 'escalated_existing' })
    }

    // Detect intent/sentiment
    const intent = detectIntent(msgBody)
    const sentiment = detectSentiment(msgBody)
    const language = detectLanguage(msgBody)

    // Check for escalation
    if (intent === 'agent_request') {
      await sendWhatsAppMessage(phoneNumberId, from, templates.transfer || 'מעביר אותך לנציג שירות. אנא המתן.')
      return NextResponse.json({ status: 'escalated' })
    }

    // Build optimized prompt (cached per business+intent)
    const botLanguage = (biz.contact_info as Record<string, unknown>)?.bot_language as string || 'auto'
    const systemPrompt = getOrBuildPrompt({
      business: biz,
      faqs: faqRes.data || [],
      policies: polRes.data || [],
      message: msgBody,
      intent,
      botLanguage,
      isFirstMessage: true,
    })

    // Call Gemini
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      await sendWhatsAppMessage(phoneNumberId, from, 'מצטער, המערכת לא זמינה כרגע.')
      return NextResponse.json({ status: 'no ai key' })
    }

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt + '\n\nזו הודעת וואטסאפ. ענה בקצרה. אם אין מידע, התחל עם ESCALATE.' }] },
          contents: [{ role: 'user', parts: [{ text: sanitizeLLMInput(msgBody) }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 250, topP: 0.8, topK: 30 },
        }),
      }
    )

    if (!aiRes.ok) {
      console.error('Gemini error for WhatsApp:', aiRes.status)
      await sendWhatsAppMessage(phoneNumberId, from, 'מצטער, אירעה שגיאה. נסה שוב בעוד רגע.')
      return NextResponse.json({ status: 'ai error' })
    }

    const aiData = await aiRes.json()
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiContent) {
      await sendWhatsAppMessage(phoneNumberId, from, templates.no_answer || 'מצטער, לא הצלחתי למצוא תשובה. אעביר לנציג.')
      return NextResponse.json({ status: 'no content' })
    }

    // Validate AI output before sending
    const safeResponse = validateLLMOutput(aiContent)

    // Check escalation in AI response
    const needsEscalation = safeResponse.trim().startsWith('ESCALATE')

    if (needsEscalation) {
      await sendWhatsAppMessage(phoneNumberId, from, templates.transfer || 'מעביר אותך לנציג שירות. אנא המתן.')
    } else {
      await sendWhatsAppMessage(phoneNumberId, from, safeResponse)
    }

    // Save conversation to DB (reuse existing conversation or create new one)
    try {
      // Check for existing open conversation from this customer
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('business_id', biz.id)
        .eq('customer', from)
        .eq('channel', 'whatsapp')
        .order('started_at', { ascending: false })
        .limit(1)
        .single()

      let convId: string | null = existingConv?.id || null

      if (!convId) {
        const { data: newConvId } = await supabase.rpc('insert_conversation', {
          p_business_id: biz.id, p_channel: 'whatsapp', p_customer: from, p_language: language,
        })
        convId = newConvId
      }
      if (convId) {
        await supabase.rpc('insert_messages', {
          p_conv_id: convId, p_customer_content: msgBody.slice(0, 2000),
          p_bot_content: needsEscalation ? `[העברה לנציג]` : aiContent,
          p_intent: intent, p_sentiment: sentiment, p_layer: needsEscalation ? 'transfer' : 'ai',
        })
      }
    } catch (dbErr) {
      console.error('DB error saving WhatsApp conv:', dbErr)
    }

    console.log(`WhatsApp: ${needsEscalation ? 'ESCALATED' : 'Replied to'} ${from}`)
    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Send WhatsApp message via Meta API
async function sendWhatsAppMessage(phoneNumberId: string, to: string, text: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!token || !phoneNumberId) {
    console.error('WhatsApp not configured: missing token or phone ID')
    return false
  }

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error('WhatsApp send error:', err)
    return false
  }

  return true
}
