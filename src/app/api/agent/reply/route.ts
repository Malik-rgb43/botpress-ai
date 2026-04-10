import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildEmailHtml } from '@/services/email-template'
import { sanitizeText, sanitizeEmail, isValidEmail } from '@/lib/sanitize'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 req/min
    const rlKey = getRateLimitKey(request, 'agent-reply')
    const rl = checkRateLimit(rlKey, { limit: 20, windowMs: 60 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded', retryAfter: rl.retryAfter }, { status: 429 })
    }

    const body = await request.json()
    const to = sanitizeEmail(body.to)
    const message = sanitizeText(body.message, 5000)
    const channel = typeof body.channel === 'string' ? body.channel : ''

    if (!to || !message || !channel) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!['email', 'whatsapp', 'widget'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    if (channel === 'email' && !isValidEmail(to)) {
      return NextResponse.json({ error: 'כתובת אימייל לא תקינה' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'No business' }, { status: 404 })

    if (channel === 'email') {
      // Send via Gmail API
      const refreshToken = business.contact_info?.gmail_refresh_token
      if (!refreshToken) {
        return NextResponse.json({ success: false, error: 'Gmail לא מחובר' })
      }

      // Refresh token
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
      if (!tokens.access_token) {
        return NextResponse.json({ success: false, error: 'Token refresh failed' })
      }

      // Build HTML email
      const htmlEmail = buildEmailHtml({
        template: (business.contact_info?.email_template as 'modern' | 'classic' | 'minimal') || 'modern',
        businessName: business.name,
        logoUrl: business.logo_url,
        primaryColor: business.contact_info?.brand_color || '#2563eb',
        replyContent: message,
        footerText: business.contact_info?.email_footer,
      })

      // Send via Gmail
      const subject = `=?UTF-8?B?${Buffer.from(`תגובה מ-${business.name}`).toString('base64')}?=`
      const boundary = `boundary_${Date.now()}`
      const rawEmail = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        '',
        message,
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
        headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: encoded }),
      })

      if (sendRes.ok) {
        return NextResponse.json({ success: true })
      } else {
        const err = await sendRes.text()
        console.error('Gmail send error:', err.substring(0, 200))
        return NextResponse.json({ success: false, error: 'שגיאה בשליחת האימייל' })
      }

    } else if (channel === 'whatsapp') {
      // Send via WhatsApp API
      const token = process.env.WHATSAPP_ACCESS_TOKEN
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || business.contact_info?.whatsapp_phone_id

      if (!token || !phoneId) {
        return NextResponse.json({ success: false, error: 'WhatsApp לא מוגדר' })
      }

      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        }),
      })

      if (res.ok) {
        return NextResponse.json({ success: true })
      } else {
        const err = await res.text()
        console.error('WhatsApp send error:', err.substring(0, 200))
        return NextResponse.json({ success: false, error: 'שגיאה בשליחת ההודעה בוואטסאפ' })
      }

    } else {
      return NextResponse.json({ success: false, error: 'ערוץ לא נתמך' })
    }

  } catch (error) {
    console.error('Agent reply error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
