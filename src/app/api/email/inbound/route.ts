import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSystemPrompt, detectIntent, detectSentiment, detectLanguage } from '@/services/ai-engine'
import { sendMessage } from '@/services/channel-service'
import type { AIContext } from '@/services/ai-engine'

// This webhook receives incoming emails and auto-responds with AI
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const pushSecret = request.nextUrl.searchParams.get('secret')
    if (!pushSecret || pushSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Resend inbound email webhook format
    const {
      from: senderEmail,
      to: recipientEmail,
      subject,
      text: emailBody,
      html: emailHtml,
    } = body

    if (!senderEmail || !emailBody) {
      return NextResponse.json({ error: 'Missing email data' }, { status: 400 })
    }

    // Extract plain text from email (prefer text, fallback to stripped HTML)
    const messageText = emailBody || (emailHtml || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)

    if (!messageText || messageText.trim().length === 0) {
      return NextResponse.json({ error: 'Empty email' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find business by email — match the recipient email to a business contact email
    // First try exact match on contact_info->email
    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')

    // Find business where contact email matches recipient
    const business = businesses?.find(b => {
      const contactEmail = b.contact_info?.email
      if (!contactEmail) return false
      // Check if the recipient email contains the business contact email domain
      return recipientEmail?.includes(contactEmail) || contactEmail === recipientEmail
    })

    if (!business) {
      console.log('No business found for recipient:', recipientEmail)
      return NextResponse.json({ error: 'No business found for this email' }, { status: 404 })
    }

    // Load business FAQ and policies
    const [faqRes, polRes, tmpRes] = await Promise.all([
      supabase.from('faqs').select('*').eq('business_id', business.id).order('order'),
      supabase.from('policies').select('*').eq('business_id', business.id),
      supabase.from('response_templates').select('*').eq('business_id', business.id),
    ])

    const templates: Record<string, string> = {}
    tmpRes.data?.forEach(t => { templates[t.type] = t.content })

    // Detect intent and sentiment
    const intent = detectIntent(messageText)
    const sentiment = detectSentiment(messageText)
    const language = detectLanguage(messageText)

    // Build AI context
    const context: AIContext = {
      business,
      faqs: faqRes.data || [],
      policies: polRes.data || [],
      templates,
      conversationHistory: [],
      customerLanguage: language,
    }

    const systemPrompt = buildSystemPrompt(context)

    // Call Gemini for response
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt + '\n\nזו הודעת אימייל מלקוח. ענה בצורה מתאימה לאימייל — קצת יותר מפורט מצ׳אט, אבל עדיין ממוקד.' }] },
          contents: [{ role: 'user', parts: [{ text: `נושא: ${subject || 'ללא נושא'}\n\n${messageText}` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
        }),
      }
    )

    if (!aiRes.ok) {
      console.error('Gemini error for email:', aiRes.status)
      return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
    }

    const aiData = await aiRes.json()
    const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiContent) {
      return NextResponse.json({ error: 'No AI response generated' }, { status: 500 })
    }

    // Send the reply email
    const replySubject = subject?.startsWith('Re:') ? subject : `Re: ${subject || 'תגובה מ' + business.name}`

    const emailResult = await sendMessage({
      to: senderEmail,
      content: aiContent,
      channel: 'email',
      subject: replySubject,
      businessName: business.name,
    })

    // Save conversation to database
    try {
      // Create or find customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('business_id', business.id)
        .eq('identifier', senderEmail)
        .single()

      if (!existingCustomer) {
        await supabase.from('customers').insert({
          business_id: business.id,
          identifier: senderEmail,
          display_name: senderEmail.split('@')[0],
          language,
        })
      }

      // Create conversation
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          business_id: business.id,
          channel: 'email',
          customer_identifier: senderEmail,
          detected_language: language,
        })
        .select('id')
        .single()

      if (conv) {
        // Save both messages
        await supabase.from('messages').insert([
          {
            conversation_id: conv.id,
            role: 'customer',
            content: messageText.slice(0, 2000),
            intent,
            sentiment,
          },
          {
            conversation_id: conv.id,
            role: 'bot',
            content: aiContent,
            response_layer: 'ai',
          },
        ])
      }
    } catch (dbError) {
      console.error('Error saving email conversation:', dbError)
      // Don't fail the response — email was already sent
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      messageId: emailResult.messageId,
      intent,
      sentiment,
    })

  } catch (error) {
    console.error('Inbound email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
