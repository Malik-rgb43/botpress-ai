import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/services/channel-service'

export async function POST(request: NextRequest) {
  try {
    const { to, businessName } = await request.json()

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const result = await sendMessage({
      to,
      content: `שלום! 👋\n\nזוהי הודעת בדיקה מהבוט של ${businessName || 'העסק שלך'}.\n\nהאימייל מחובר ועובד בהצלחה! מעכשיו הבוט יכול לשלוח תגובות ללקוחות שלך גם באימייל.\n\nצוות BotPress AI`,
      channel: 'email',
      subject: `✅ בדיקת חיבור — ${businessName || 'BotPress AI'}`,
      businessName,
    })

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
