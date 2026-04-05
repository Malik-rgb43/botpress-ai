import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildEmailHtml } from '@/services/email-template'

export async function POST(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get businesses with summaries enabled
  const { data: settings } = await supabase
    .from('summary_settings')
    .select('*, businesses(*)')
    .eq('enabled', true)

  if (!settings || settings.length === 0) {
    return NextResponse.json({ message: 'No summaries to send', processed: 0 })
  }

  let processed = 0

  for (const setting of settings) {
    try {
      const business = setting.businesses
      if (!business) continue

      // Calculate date range based on frequency
      const now = new Date()
      let startDate = new Date()
      if (setting.frequency === 'daily') startDate.setDate(now.getDate() - 1)
      else if (setting.frequency === 'weekly') startDate.setDate(now.getDate() - 7)
      else startDate.setMonth(now.getMonth() - 1)

      // Get stats
      const [convRes, msgRes, escRes] = await Promise.all([
        supabase.from('conversations').select('id, channel, satisfaction_rating', { count: 'exact' })
          .eq('business_id', business.id)
          .gte('started_at', startDate.toISOString()),
        supabase.from('messages').select('id, role, sentiment', { count: 'exact' })
          .gte('created_at', startDate.toISOString()),
        supabase.from('escalations').select('id', { count: 'exact' })
          .gte('created_at', startDate.toISOString()),
      ])

      const totalConversations = convRes.count || 0
      const totalMessages = msgRes.count || 0
      const totalEscalations = escRes.count || 0

      // Calculate averages
      const ratings = (convRes.data || []).filter(c => c.satisfaction_rating).map(c => c.satisfaction_rating)
      const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : 'N/A'

      // Channel breakdown
      const channels = (convRes.data || []).reduce((acc: Record<string, number>, c: any) => {
        acc[c.channel] = (acc[c.channel] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Build summary text
      const periodLabel = setting.frequency === 'daily' ? 'יומי' : setting.frequency === 'weekly' ? 'שבועי' : 'חודשי'

      const summaryText = `סיכום ${periodLabel} — ${business.name}

שיחות: ${totalConversations}
הודעות: ${totalMessages}
העברות לנציג: ${totalEscalations}
שביעות רצון ממוצעת: ${avgRating}

חלוקה לפי ערוצים:
${Object.entries(channels).map(([ch, count]) => `  ${ch === 'email' ? 'אימייל' : ch === 'whatsapp' ? 'וואטסאפ' : 'וידג׳ט'}: ${count}`).join('\n')}

${totalEscalations > 0 ? `\nשים לב: ${totalEscalations} שיחות הועברו לנציג. בדוק אם יש שאלות שהבוט לא יודע לענות עליהן.` : ''}
${totalConversations === 0 ? '\nלא היו שיחות בתקופה הזו.' : ''}`

      // Send via Gmail if connected, otherwise skip
      const refreshToken = business.contact_info?.gmail_refresh_token
      if (refreshToken) {
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

        if (tokens.access_token) {
          // Build HTML summary
          const htmlSummary = buildEmailHtml({
            template: (business.contact_info?.email_template as any) || 'modern',
            businessName: business.name,
            logoUrl: business.logo_url,
            primaryColor: business.contact_info?.brand_color || '#2563eb',
            replyContent: summaryText,
          })

          const subject = `=?UTF-8?B?${Buffer.from(`סיכום ${periodLabel} — ${business.name}`).toString('base64')}?=`
          const boundary = `boundary_${Date.now()}`
          const raw = Buffer.from([
            `To: ${setting.email}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/plain; charset=UTF-8',
            '',
            summaryText,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset=UTF-8',
            '',
            htmlSummary,
            '',
            `--${boundary}--`,
          ].join('\r\n')).toString('base64url')

          await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw }),
          })

          processed++
          console.log(`Summary sent to ${setting.email} for ${business.name}`)
        }
      }
    } catch (err) {
      console.error('Summary error:', err)
    }
  }

  return NextResponse.json({ message: 'Summaries sent', processed })
}
