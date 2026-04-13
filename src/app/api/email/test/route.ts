import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildEmailHtml } from '@/services/email-template'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 3 test emails per hour to prevent spam abuse
  const rlKey = getRateLimitKey(request, 'email-test')
  const rl = checkRateLimit(rlKey, { limit: 3, windowMs: 60 * 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many test emails. Try again later.', retryAfter: rl.retryAfter }, { status: 429 })
  }

  try {
    const { to, businessName } = await request.json()

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Get business Gmail tokens
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('contact_info')
      .eq('user_id', user.id)
      .single()

    if (!business?.contact_info?.gmail_refresh_token) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    }

    // Refresh access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: business.contact_info.gmail_refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Failed to refresh Gmail token' }, { status: 500 })
    }

    // Send test email via Gmail API
    const replyContent = `שלום! 👋\n\nזוהי הודעת בדיקה מהבוט של ${businessName || 'העסק שלך'}.\n\n✅ האימייל מחובר ועובד בהצלחה!\n\nמעכשיו הבוט יכול לענות ללקוחות שלך באופן אוטומטי דרך האימייל.\n\nצוות BotPress AI`

    const templateName = (business.contact_info?.email_template as string) || 'modern'
    const htmlEmail = buildEmailHtml({
      template: templateName as any,
      businessName: businessName || 'BotPress AI',
      logoUrl: null,
      primaryColor: (business.contact_info?.brand_color as string) || '#2563eb',
      replyContent,
      footerText: 'זוהי הודעת בדיקה — לקוחות יקבלו אימייל בסגנון הזה',
    })

    const subject = `בדיקת חיבור — ${businessName || 'BotPress AI'}`
    const boundary = `boundary_${Date.now()}`
    const rawEmail = [
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      replyContent,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlEmail,
      '',
      `--${boundary}--`,
    ].join('\r\n')

    const encoded = Buffer.from(rawEmail).toString('base64url')

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    })

    if (sendRes.ok) {
      const data = await sendRes.json()
      return NextResponse.json({ success: true, messageId: data.id })
    } else {
      const err = await sendRes.text()
      console.error('Gmail send error:', err)
      return NextResponse.json({ success: false, error: 'Failed to send via Gmail' }, { status: 500 })
    }
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
