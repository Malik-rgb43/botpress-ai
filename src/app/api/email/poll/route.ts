import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSystemPrompt, detectIntent, detectSentiment, detectLanguage } from '@/services/ai-engine'
import { sendMessage } from '@/services/channel-service'
import type { AIContext } from '@/services/ai-engine'

// Refresh Gmail access token using refresh token
async function refreshGmailToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token || null
}

// Get unread emails from Gmail
async function getUnreadEmails(accessToken: string): Promise<Array<{id: string, from: string, subject: string, body: string}>> {
  // Search for unread emails not from the bot itself
  const searchRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread -from:me -from:noreply -from:no-reply -from:resend.dev&maxResults=5`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const searchData = await searchRes.json()

  if (!searchData.messages || searchData.messages.length === 0) return []

  const emails = []
  for (const msg of searchData.messages.slice(0, 5)) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const msgData = await msgRes.json()

    // Extract headers
    const headers = msgData.payload?.headers || []
    const from = headers.find((h: {name: string}) => h.name === 'From')?.value || ''
    const subject = headers.find((h: {name: string}) => h.name === 'Subject')?.value || ''

    // Skip emails from noreply, bots, etc.
    if (from.includes('noreply') || from.includes('no-reply') || from.includes('mailer-daemon') || from.includes('resend.dev')) {
      continue
    }

    // Extract body text
    let body = ''
    const parts = msgData.payload?.parts || []
    if (parts.length > 0) {
      const textPart = parts.find((p: {mimeType: string}) => p.mimeType === 'text/plain')
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
      }
    } else if (msgData.payload?.body?.data) {
      body = Buffer.from(msgData.payload.body.data, 'base64').toString('utf-8')
    }

    // Clean up body — remove quoted replies
    body = body.split(/\n--\n|\nOn .* wrote:|\n>/).shift() || body
    body = body.trim().slice(0, 3000)

    if (body.length > 0) {
      emails.push({ id: msg.id, from, subject, body })
    }
  }

  return emails
}

// Mark email as read
async function markAsRead(accessToken: string, messageId: string) {
  await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
    }
  )
}

// Reply to email via Gmail API (sends FROM the business's email)
async function replyViaGmail(accessToken: string, originalMessageId: string, to: string, subject: string, replyBody: string) {
  // Get original message to get threadId
  const msgRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${originalMessageId}?format=metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const msgData = await msgRes.json()
  const threadId = msgData.threadId

  // Build raw email
  const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`
  const rawEmail = [
    `To: ${to}`,
    `Subject: ${replySubject}`,
    `In-Reply-To: ${originalMessageId}`,
    `References: ${originalMessageId}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    replyBody,
  ].join('\r\n')

  const encodedEmail = Buffer.from(rawEmail).toString('base64url')

  const sendRes = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
        threadId,
      }),
    }
  )

  return sendRes.ok
}

// Main polling endpoint — called periodically
export async function POST(request: NextRequest) {
  try {
    // Verify — accept Vercel Cron header OR Bearer token
    const cronHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'botpress-poll-secret-2026'
    const vercelCron = request.headers.get('x-vercel-cron')
    if (!vercelCron && cronHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get Gmail-connected businesses via SECURITY DEFINER function (bypasses RLS)
    const { data: rpcData } = await supabase.rpc('get_gmail_businesses')
    let connectedBusinesses = (rpcData || []).filter((b: Record<string, unknown>) => {
      const info = b.contact_info as Record<string, unknown> | null
      return info?.gmail_refresh_token
    })

    // Fallback to direct query if RPC returns nothing
    if (connectedBusinesses.length === 0) {
      const { data: allBiz } = await supabase.from('businesses').select('*')
      connectedBusinesses = (allBiz || []).filter((b: Record<string, unknown>) => {
        const info = b.contact_info as Record<string, unknown> | null
        return info?.gmail_connected && info?.gmail_refresh_token
      })
    }

    if (connectedBusinesses.length === 0) {
      return NextResponse.json({ message: 'No connected businesses', processed: 0 })
    }

    let totalProcessed = 0

    for (const business of connectedBusinesses) {
      try {
        // Refresh access token
        const accessToken = await refreshGmailToken(business.contact_info.gmail_refresh_token)
        if (!accessToken) {
          console.error('Failed to refresh token for business:', business.id)
          continue
        }

        // Update stored access token
        await supabase.from('businesses').update({
          contact_info: {
            ...business.contact_info,
            gmail_access_token: accessToken,
            gmail_token_expiry: Date.now() + 3600000,
          }
        }).eq('id', business.id)

        // Get unread emails
        const unreadEmails = await getUnreadEmails(accessToken)

        if (unreadEmails.length === 0) continue

        // Load business FAQ and policies
        const [faqRes, polRes, tmpRes] = await Promise.all([
          supabase.from('faqs').select('*').eq('business_id', business.id).order('order'),
          supabase.from('policies').select('*').eq('business_id', business.id),
          supabase.from('response_templates').select('*').eq('business_id', business.id),
        ])

        const templates: Record<string, string> = {}
        tmpRes.data?.forEach(t => { templates[t.type] = t.content })

        for (const email of unreadEmails) {
          try {
            // Duplicate protection — check if we already replied to this email
            const senderEmail = email.from.match(/<([^>]+)>/)?.[1] || email.from.split(' ').pop() || ''
            const { data: existingConv } = await supabase
              .from('conversations')
              .select('id')
              .eq('business_id', business.id)
              .eq('customer_identifier', senderEmail)
              .gte('started_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
              .limit(1)

            if (existingConv && existingConv.length > 0) {
              // Already replied to this sender recently, skip
              await markAsRead(accessToken, email.id)
              continue
            }
            const intent = detectIntent(email.body)
            const sentiment = detectSentiment(email.body)
            const language = detectLanguage(email.body)

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

            // Call Gemini
            const geminiKey = process.env.GEMINI_API_KEY
            if (!geminiKey) continue

            const aiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  system_instruction: { parts: [{ text: systemPrompt + `\n\nזו הודעת אימייל מלקוח. ענה בצורה מתאימה — מפורט קצת יותר מצ׳אט אבל ממוקד.

חשוב מאוד: אם אתה לא יכול לענות על השאלה (למשל: צריך גישה למערכת, שאלה מורכבת מדי, תלונה רצינית, או שאין לך מספיק מידע), התחל את התשובה שלך עם המילה ESCALATE ואז הסבר בקצרה למה.

דוגמה לתשובה רגילה: "אנחנו פתוחים א-ה 9:00-18:00."
דוגמה ל-ESCALATE: "ESCALATE - הלקוח שואל על הזמנה ספציפית שצריך לבדוק במערכת"` }] },
                  contents: [{ role: 'user', parts: [{ text: `נושא: ${email.subject}\n\n${email.body}` }] }],
                  generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
                }),
              }
            )

            if (!aiRes.ok) {
              console.error('Gemini error for email:', email.id)
              continue
            }

            const aiData = await aiRes.json()
            const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

            if (!aiContent) continue

            const needsEscalation = aiContent.trim().startsWith('ESCALATE')
            const businessEmail = business.contact_info?.email || ''

            if (needsEscalation) {
              // ── ESCALATION: Send notification to business owner ──
              const escalationReason = aiContent.replace(/^ESCALATE\s*[-–—]?\s*/i, '').trim()

              // Send notification email to business owner
              await sendMessage({
                to: businessEmail,
                content: `📬 לקוח צריך מענה אנושי!\n\n👤 מאימייל: ${senderEmail}\n📋 נושא: ${email.subject}\n\n💬 ההודעה של הלקוח:\n"${email.body.slice(0, 500)}"\n\n🤖 הסיבה שהבוט לא ענה:\n${escalationReason}\n\n⚡ אנא ענה ללקוח ישירות מהאימייל שלך.`,
                channel: 'email',
                subject: `⚠️ צריך מענה אנושי — ${senderEmail} שאל על: ${email.subject}`,
                businessName: business.name,
              })

              // Mark as read
              await markAsRead(accessToken, email.id)

              // Save to DB as escalation
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
                await supabase.from('messages').insert([
                  { conversation_id: conv.id, role: 'customer', content: email.body.slice(0, 2000), intent, sentiment },
                  { conversation_id: conv.id, role: 'bot', content: `[העברה לנציג] ${escalationReason}`, response_layer: 'transfer' },
                ])
                await supabase.from('escalations').insert({
                  conversation_id: conv.id,
                  reason: escalationReason,
                  status: 'open',
                })
              }

              totalProcessed++
              console.log(`ESCALATED: ${senderEmail} → notified ${businessEmail}`)

            } else {
              // ── NORMAL: Reply directly to customer ──
              const sent = await replyViaGmail(accessToken, email.id, senderEmail, email.subject, aiContent)

              if (sent) {
                await markAsRead(accessToken, email.id)

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
                  await supabase.from('messages').insert([
                    { conversation_id: conv.id, role: 'customer', content: email.body.slice(0, 2000), intent, sentiment },
                    { conversation_id: conv.id, role: 'bot', content: aiContent, response_layer: 'ai' },
                  ])
                }

                totalProcessed++
                console.log(`Replied to ${senderEmail} for business ${business.name}`)
              }
            }
          } catch (emailError) {
            console.error('Error processing email:', email.id, emailError)
          }
        }
      } catch (bizError) {
        console.error('Error processing business:', business.id, bizError)
      }
    }

    return NextResponse.json({ message: 'Poll complete', processed: totalProcessed })
  } catch (error) {
    console.error('Email poll error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
