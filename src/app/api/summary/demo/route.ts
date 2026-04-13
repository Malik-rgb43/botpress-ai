import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSummaryHtml } from '@/services/summary-template'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, email } = body

    if (!businessId || !email) {
      return NextResponse.json({ error: 'Missing businessId or email' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const rlKey = getRateLimitKey(request, 'summary', businessId)
    const rl = await checkRateLimit(rlKey, RATE_LIMITS.summary)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const supabase = createAdminClient()

    const { data: bizData } = await supabase.rpc('get_business_by_id', { p_id: businessId })
    const business = bizData?.[0]
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    // Verify ownership
    if (business.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build date range string
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const dateRange = `${weekAgo.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })} — ${now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}`

    // Build professional HTML summary with charts
    const htmlSummary = buildSummaryHtml({
      businessName: business.name,
      logoUrl: business.logo_url,
      primaryColor: business.contact_info?.brand_color || '#3b82f6',
      period: 'שבועי',
      dateRange,
      kpis: {
        conversations: 47,
        messages: 156,
        escalations: 5,
        satisfaction: '4.3',
        autoRate: '92%',
        avgResponseTime: '1.2 שניות',
      },
      channels: {
        widget: 28,
        email: 14,
        whatsapp: 5,
      },
      topQuestions: [
        { question: 'מה שעות הפעילות?', count: 12 },
        { question: 'מה מדיניות ההחזרות?', count: 8 },
        { question: 'כמה עולה משלוח?', count: 6 },
        { question: 'האם יש מבצעים?', count: 5 },
        { question: 'איך יוצרים קשר?', count: 4 },
      ],
      sentiments: {
        positive: 58,
        neutral: 28,
        negative: 10,
        angry: 4,
      },
      insights: [
        '92% מהשיחות נענו אוטומטית ללא צורך בנציג — שיפור של 8% מהשבוע הקודם',
        'זמן תגובה ממוצע: 1.2 שניות — מהיר מ-95% מהעסקים בפלטפורמה',
        '5 שיחות הועברו לנציג — רובן בנושא החזרים כספיים',
        'שעות הפעילות הן השאלה הנפוצה ביותר — שווה לשקול להוסיף באנר באתר',
      ],
      recommendations: [
        'הוסף FAQ על תהליך החזר כספי כדי לצמצם 60% מהעברות לנציג',
        'שקול להרחיב את שעות הפעילות — 8 שיחות הגיעו אחרי 18:00',
        'הוסף תשובה אוטומטית למבצעים — 5 לקוחות שאלו והבוט לא ידע לענות',
      ],
      isDemo: true,
    })

    // Plain text fallback
    const plainText = `סיכום שבועי — ${business.name}\n\nשיחות: 47 | הודעות: 156 | העברות: 5 | שביעות רצון: 4.3\n\nזה סיכום לדוגמה. הסיכום האמיתי ייווצר מהנתונים שלך.`

    // Send via Gmail
    const refreshToken = business.contact_info?.gmail_refresh_token
    if (!refreshToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Failed to refresh Gmail token' }, { status: 500 })
    }

    const subject = `=?UTF-8?B?${Buffer.from(`📊 סיכום שבועי — ${business.name}`).toString('base64')}?=`
    const boundary = `boundary_${Date.now()}`
    const raw = Buffer.from([
      `To: ${email}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      plainText,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      htmlSummary,
      '',
      `--${boundary}--`,
    ].join('\r\n')).toString('base64url')

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    })

    if (!gmailRes.ok) {
      console.error('Gmail send error:', await gmailRes.text().catch(() => ''))
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Demo summary sent to ${email}` })
  } catch (error) {
    console.error('Demo summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
