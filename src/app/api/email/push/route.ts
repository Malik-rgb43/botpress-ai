import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { detectIntent, detectSentiment, detectLanguage } from '@/services/ai-engine'
import { getOrBuildPrompt } from '@/services/prompt-builder'
import { safeDecrypt } from '@/lib/encryption'

// Gmail Push Notification handler — called by Google Pub/Sub when new email arrives
export async function POST(request: NextRequest) {
  try {
    // Verify push secret — constant-time comparison
    const pushSecret = request.headers.get('authorization')?.replace('Bearer ', '') || request.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.CRON_SECRET
    if (!pushSecret || !expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const crypto = await import('crypto')
    const sBuf = Buffer.from(pushSecret)
    const eBuf = Buffer.from(expectedSecret)
    if (sBuf.length !== eBuf.length || !crypto.timingSafeEqual(sBuf, eBuf)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Pub/Sub sends base64-encoded message
    const messageData = body.message?.data
    if (!messageData) {
      return NextResponse.json({ status: 'no data' })
    }

    // Decode — contains { emailAddress, historyId }
    const decoded = JSON.parse(Buffer.from(messageData, 'base64').toString())
    const emailAddress = decoded.emailAddress
    const historyId = decoded.historyId

    if (!emailAddress) {
      return NextResponse.json({ status: 'no email' })
    }

    console.log(`Gmail push: new mail for ${emailAddress}, historyId: ${historyId}`)

    const supabase = createAdminClient()

    // Find business by connected Gmail
    const { data: rpcData } = await supabase.rpc('get_gmail_businesses')
    const business = (rpcData || []).find((b: Record<string, unknown>) => {
      const info = b.contact_info as Record<string, unknown> | null
      return info?.email === emailAddress
    })

    if (!business) {
      console.log('No business found for email:', emailAddress)
      return NextResponse.json({ status: 'no business' })
    }

    // Refresh token
    const rawRefreshToken = (business.contact_info as Record<string, unknown>)?.gmail_refresh_token as string
    if (!rawRefreshToken) return NextResponse.json({ status: 'no token' })

    // Decrypt stored token (handles plaintext for backwards compat)
    const refreshToken = safeDecrypt(rawRefreshToken)

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return NextResponse.json({ status: 'token refresh failed' })

    const accessToken = tokens.access_token

    // Get unread emails — simple filter, just exclude obvious bots
    const q = encodeURIComponent('is:unread in:inbox -from:me -from:noreply -from:no-reply -from:mailer-daemon')
    const searchRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=3`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const searchData = await searchRes.json()
    console.log('Push: found', searchData.messages?.length || 0, 'unread emails')

    if (!searchData.messages || searchData.messages.length === 0) {
      return NextResponse.json({ status: 'no unread' })
    }

    // Load business data
    const [faqRes, polRes, tmpRes] = await Promise.all([
      supabase.from('faqs').select('*').eq('business_id', business.id).order('order'),
      supabase.from('policies').select('*').eq('business_id', business.id),
      supabase.from('response_templates').select('*').eq('business_id', business.id),
    ])
    const templates: Record<string, string> = {}
    tmpRes.data?.forEach((t: { type: string; content: string }) => { templates[t.type] = t.content })

    let processed = 0

    for (const msg of searchData.messages.slice(0, 3)) {
      // Get full message
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const msgData = await msgRes.json()

      const headers = msgData.payload?.headers || []
      const from = headers.find((h: { name: string }) => h.name === 'From')?.value || ''
      const subject = headers.find((h: { name: string }) => h.name === 'Subject')?.value || ''

      console.log('Push: processing email from', from.substring(0, 40), 'subject:', subject.substring(0, 30))

      if (from.includes('noreply') || from.includes('no-reply') || from.includes('mailer-daemon')) {
        console.log('Push: skipping noreply email')
        continue
      }

      // Extract body
      let emailBody = ''
      const parts = msgData.payload?.parts || []
      if (parts.length > 0) {
        const textPart = parts.find((p: { mimeType: string }) => p.mimeType === 'text/plain')
        if (textPart?.body?.data) emailBody = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
      } else if (msgData.payload?.body?.data) {
        emailBody = Buffer.from(msgData.payload.body.data, 'base64').toString('utf-8')
      }
      emailBody = emailBody.split(/\n--\n|\nOn .* wrote:|\n>/).shift() || emailBody
      emailBody = emailBody.trim().slice(0, 3000)

      if (!emailBody) continue

      const senderEmail = from.match(/<([^>]+)>/)?.[1] || from.split(' ').pop() || ''

      // Duplicate check (2 min window)
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('business_id', business.id)
        .eq('customer', senderEmail)
        .gte('started_at', new Date(Date.now() - 120000).toISOString())
        .limit(1)
      if (existing && existing.length > 0) continue

      // AI processing
      const intent = detectIntent(emailBody)
      const sentiment = detectSentiment(emailBody)
      const language = detectLanguage(emailBody)

      const botLanguage = (business.contact_info as Record<string, unknown>)?.bot_language as string || 'auto'
      const systemPrompt = getOrBuildPrompt({
        business,
        faqs: faqRes.data || [],
        policies: polRes.data || [],
        message: emailBody,
        intent,
        botLanguage,
        isFirstMessage: true,
      })

      const geminiKey = process.env.GEMINI_API_KEY
      if (!geminiKey) continue

      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt + '\n\nזו הודעת אימייל. ענה מפורט קצת יותר. אם אין מידע, התחל עם ESCALATE.' }] },
            contents: [{ role: 'user', parts: [{ text: `נושא: ${subject}\n\n${emailBody}` }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500, topP: 0.8, topK: 30 },
          }),
        }
      )

      if (!aiRes.ok) {
        const errText = await aiRes.text().catch(() => '')
        console.error('Push: Gemini error', aiRes.status, errText.substring(0, 200))
        await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
        })
        continue
      }

      const aiData = await aiRes.json()
      const aiContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text
      if (!aiContent) {
        console.log('Push: no AI content, skipping')
        continue
      }
      console.log('Push: AI responded, length:', aiContent.length, 'escalate:', aiContent.startsWith('ESCALATE'))

      const needsEscalation = aiContent.trim().startsWith('ESCALATE')

      if (needsEscalation) {
        // Notify business owner
        const reason = aiContent.replace(/^ESCALATE\s*[-–—]?\s*/i, '').trim()
        const notifBody = `לקוח צריך מענה אנושי!\n\nמאימייל: ${senderEmail}\nנושא: ${subject}\n\nההודעה:\n${emailBody.slice(0, 500)}\n\nהסיבה: ${reason}`
        const notifSubject = `=?UTF-8?B?${Buffer.from(`צריך מענה אנושי — ${senderEmail}`).toString('base64')}?=`
        const raw = Buffer.from(`To: ${emailAddress}\nSubject: ${notifSubject}\nContent-Type: text/plain; charset=UTF-8\n\n${notifBody}`).toString('base64url')
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw }),
        })
      } else {
        // Reply to customer
        const threadId = msgData.threadId
        const replySubject = `=?UTF-8?B?${Buffer.from(subject.startsWith('Re:') ? subject : `Re: ${subject}`).toString('base64')}?=`
        const raw = Buffer.from(`To: ${senderEmail}\nSubject: ${replySubject}\nIn-Reply-To: ${msg.id}\nReferences: ${msg.id}\nContent-Type: text/plain; charset=UTF-8\n\n${aiContent}`).toString('base64url')
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw, threadId }),
        })
      }

      // Mark as read
      await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeLabelIds: ['UNREAD'] }),
      })

      // Save to DB
      const { data: conv } = await supabase.from('conversations').insert({
        business_id: business.id, channel: 'email', customer_identifier: senderEmail, detected_language: language,
      }).select('id').single()
      if (conv) {
        await supabase.from('messages').insert([
          { conversation_id: conv.id, role: 'customer', content: emailBody.slice(0, 2000), intent, sentiment },
          { conversation_id: conv.id, role: 'bot', content: needsEscalation ? `[העברה לנציג] ${aiContent}` : aiContent, response_layer: needsEscalation ? 'transfer' : 'ai' },
        ])
      }

      processed++
      console.log(`Push: ${needsEscalation ? 'ESCALATED' : 'Replied to'} ${senderEmail}`)
    }

    return NextResponse.json({ status: 'ok', processed })
  } catch (error) {
    console.error('Gmail push error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
