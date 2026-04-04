import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSystemPrompt, detectIntent, detectSentiment, detectLanguage } from '@/services/ai-engine'
import type { AIContext } from '@/services/ai-engine'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'botpress-whatsapp-verify'

// WhatsApp Webhook Verification (GET)
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// WhatsApp Incoming Message (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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
    const msgBody = message.text?.body // Message text
    const phoneNumberId = value.metadata?.phone_number_id

    if (!msgBody || !from) {
      return NextResponse.json({ status: 'no text' })
    }

    console.log(`WhatsApp message from ${from}: ${msgBody.substring(0, 50)}`)

    const supabase = createAdminClient()

    // Find business by WhatsApp phone number ID
    const { data: rpcData } = await supabase.rpc('get_gmail_businesses')
    // For now, get all businesses and find one with WhatsApp configured
    const { data: allBiz } = await supabase.from('businesses').select('*')
    const business = (allBiz || []).find((b: Record<string, unknown>) => {
      const info = b.contact_info as Record<string, unknown> | null
      return info?.whatsapp_phone_id === phoneNumberId || info?.whatsapp_connected
    })

    if (!business) {
      // Fallback: use the first business if only one exists
      if (allBiz && allBiz.length === 1) {
        var biz = allBiz[0]
      } else {
        console.log('No business found for WhatsApp phone:', phoneNumberId)
        return NextResponse.json({ status: 'no business' })
      }
    } else {
      var biz = business
    }

    // Load business data
    const [faqRes, polRes, tmpRes] = await Promise.all([
      supabase.from('faqs').select('*').eq('business_id', biz.id).order('order'),
      supabase.from('policies').select('*').eq('business_id', biz.id),
      supabase.from('response_templates').select('*').eq('business_id', biz.id),
    ])
    const templates: Record<string, string> = {}
    tmpRes.data?.forEach((t: { type: string; content: string }) => { templates[t.type] = t.content })

    // Detect intent/sentiment
    const intent = detectIntent(msgBody)
    const sentiment = detectSentiment(msgBody)
    const language = detectLanguage(msgBody)

    // Check for escalation
    if (intent === 'agent_request') {
      await sendWhatsAppMessage(phoneNumberId, from, templates.transfer || 'מעביר אותך לנציג שירות. אנא המתן.')
      return NextResponse.json({ status: 'escalated' })
    }

    // Build AI context
    const context: AIContext = {
      business: biz,
      faqs: faqRes.data || [],
      policies: polRes.data || [],
      templates,
      conversationHistory: [],
      customerLanguage: language,
    }
    const systemPrompt = buildSystemPrompt(context)

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
          system_instruction: { parts: [{ text: systemPrompt + '\n\nזו הודעת וואטסאפ מלקוח. ענה בקצרה וממוקד.' }] },
          contents: [{ role: 'user', parts: [{ text: msgBody }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
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

    // Check escalation in AI response
    const needsEscalation = aiContent.trim().startsWith('ESCALATE')

    if (needsEscalation) {
      await sendWhatsAppMessage(phoneNumberId, from, templates.transfer || 'מעביר אותך לנציג שירות. אנא המתן.')
    } else {
      await sendWhatsAppMessage(phoneNumberId, from, aiContent)
    }

    // Save conversation to DB
    try {
      const { data: convId } = await supabase.rpc('insert_conversation', {
        p_business_id: biz.id, p_channel: 'whatsapp', p_customer: from, p_language: language,
      })
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
