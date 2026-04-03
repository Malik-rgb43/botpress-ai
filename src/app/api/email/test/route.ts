import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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
    const emailBody = `שלום!\n\nזוהי הודעת בדיקה מהבוט של ${businessName || 'העסק שלך'}.\n\nהאימייל מחובר ועובד בהצלחה! מעכשיו הבוט יכול לשלוח תגובות ללקוחות שלך באופן אוטומטי.\n\nצוות BotPress AI`

    const subject = `בדיקת חיבור — ${businessName || 'BotPress AI'}`
    const rawEmail = [
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      emailBody,
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
