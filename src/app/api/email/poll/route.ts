import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSystemPrompt, detectIntent, detectSentiment, detectLanguage } from '@/services/ai-engine'
import type { AIContext } from '@/services/ai-engine'
import { buildEmailHtml } from '@/services/email-template'

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
  // Search for unread emails — filter out bots, newsletters, promotions, social
  const query = [
    'is:unread',
    'in:inbox',           // Only inbox (not spam/trash/promotions)
    '-from:me',           // Not from self
    '-from:noreply',      // Not noreply
    '-from:no-reply',
    '-from:notifications',
    '-from:newsletter',
    '-from:marketing',
    '-from:mailer-daemon',
    '-from:resend.dev',
    '-from:accounts.google.com',
    '-from:calendar-notification',
    '-category:promotions',  // Not promotional
    '-category:social',      // Not social
    '-category:updates',     // Not automated updates
    '-category:forums',      // Not forums
    '-label:spam',
  ].join(' ')
  const searchRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`,
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
async function replyViaGmail(accessToken: string, originalMessageId: string, to: string, subject: string, replyBody: string, htmlBody?: string) {
  // Get original message to get threadId
  const msgRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${originalMessageId}?format=metadata`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const msgData = await msgRes.json()
  const threadId = msgData.threadId

  // Build raw email with proper UTF-8 subject
  const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`
  const encodedSubject = `=?UTF-8?B?${Buffer.from(replySubject).toString('base64')}?=`
  const boundary = `boundary_${Date.now()}`

  let rawEmail: string
  if (htmlBody) {
    // Send multipart email with both plain text and HTML
    rawEmail = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `In-Reply-To: ${originalMessageId}`,
      `References: ${originalMessageId}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      replyBody,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlBody,
      '',
      `--${boundary}--`,
    ].join('\r\n')
  } else {
    rawEmail = [
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `In-Reply-To: ${originalMessageId}`,
      `References: ${originalMessageId}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      replyBody,
    ].join('\r\n')
  }

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
            // Extract sender email
            const senderEmail = email.from.match(/<([^>]+)>/)?.[1] || email.from.split(' ').pop() || ''

            // Duplicate protection — don't reply to the SAME email subject+sender twice
            // But allow multiple different emails from the same sender
            // Duplicate check via RPC (bypasses RLS)
            const { data: isDuplicate } = await supabase.rpc('check_recent_conversation', {
              p_business_id: business.id,
              p_customer: senderEmail,
              p_minutes: 2,
            })
            if (isDuplicate) continue
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
              const errText = await aiRes.text().catch(() => 'unknown')
              console.error('Gemini error for email:', email.id, 'status:', aiRes.status, 'body:', errText)
              // Mark as read to prevent infinite retries on the same failed email
              await markAsRead(accessToken, email.id)
              continue
            }

            const aiData = await aiRes.json()
            const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text

            // If Gemini blocked for safety, skip
            if (!aiContent && aiData.candidates?.[0]?.finishReason === 'SAFETY') {
              console.log('Gemini blocked for safety:', email.id)
              await markAsRead(accessToken, email.id)
              continue
            }

            if (!aiContent) continue

            const needsEscalation = aiContent.trim().startsWith('ESCALATE')
            const businessEmail = business.contact_info?.email || ''

            if (needsEscalation) {
              // ── ESCALATION: Notify business owner via Gmail (not Resend) ──
              const escalationReason = aiContent.replace(/^ESCALATE\s*[-–—]?\s*/i, '').trim()

              // Send notification to business owner via Gmail API (works for any email)
              const notificationBody = [
                `לקוח צריך מענה אנושי!`,
                ``,
                `מאימייל: ${senderEmail}`,
                `נושא: ${email.subject}`,
                ``,
                `ההודעה של הלקוח:`,
                `${email.body.slice(0, 500)}`,
                ``,
                `הסיבה שהבוט לא ענה:`,
                `${escalationReason}`,
                ``,
                `אנא ענה ללקוח ישירות — פשוט תעביר את המייל הזה ותענה.`,
              ].join('\n')

              // Send self-email notification via Gmail API
              const notifRaw = [
                `To: ${businessEmail}`,
                `Subject: =?UTF-8?B?${Buffer.from(`צריך מענה אנושי — ${senderEmail}`).toString('base64')}?=`,
                'Content-Type: text/plain; charset=UTF-8',
                '',
                notificationBody,
              ].join('\r\n')
              const notifEncoded = Buffer.from(notifRaw).toString('base64url')
              await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ raw: notifEncoded }),
              })

              // Mark original email as read
              await markAsRead(accessToken, email.id)

              // Save to DB via RPC (bypasses RLS)
              const { data: convId } = await supabase.rpc('insert_conversation', {
                p_business_id: business.id, p_channel: 'email', p_customer: senderEmail, p_language: language,
              })
              if (convId) {
                await supabase.rpc('insert_messages', {
                  p_conv_id: convId, p_customer_content: email.body.slice(0, 2000),
                  p_bot_content: `[העברה לנציג] ${escalationReason}`,
                  p_intent: intent, p_sentiment: sentiment, p_layer: 'transfer',
                })
              }

              totalProcessed++
              console.log(`ESCALATED: ${senderEmail} → notified ${businessEmail}`)

            } else {
              // ── NORMAL: Reply directly to customer ──
              // Build HTML email template
              const htmlEmail = buildEmailHtml({
                businessName: business.name,
                logoUrl: business.logo_url,
                primaryColor: (business.contact_info as Record<string, unknown>)?.brand_color as string || '#2563eb',
                replyContent: aiContent,
                footerText: (business.contact_info as Record<string, unknown>)?.email_footer as string || undefined,
              })
              const sent = await replyViaGmail(accessToken, email.id, senderEmail, email.subject, aiContent, htmlEmail)

              if (sent) {
                await markAsRead(accessToken, email.id)

                // Save via RPC (bypasses RLS)
                const { data: convId } = await supabase.rpc('insert_conversation', {
                  p_business_id: business.id, p_channel: 'email', p_customer: senderEmail, p_language: language,
                })
                if (convId) {
                  await supabase.rpc('insert_messages', {
                    p_conv_id: convId, p_customer_content: email.body.slice(0, 2000),
                    p_bot_content: aiContent,
                    p_intent: intent, p_sentiment: sentiment, p_layer: 'ai',
                  })
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
