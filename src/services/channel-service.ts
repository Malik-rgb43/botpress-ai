import { Resend } from 'resend'

export interface ChannelMessage {
  to: string
  content: string
  channel: 'whatsapp' | 'email' | 'widget'
  subject?: string
  businessName?: string
}

export async function sendMessage(msg: ChannelMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  switch (msg.channel) {
    case 'email':
      return sendEmail(msg)
    case 'whatsapp':
      return { success: false, error: 'WhatsApp not configured yet' }
    case 'widget':
      return { success: true }
    default:
      return { success: false, error: 'Unknown channel' }
  }
}

async function sendEmail(msg: ChannelMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  if (!apiKey) {
    return { success: false, error: 'Email not configured' }
  }

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: msg.businessName ? `${msg.businessName} <${fromEmail}>` : fromEmail,
      to: msg.to,
      subject: msg.subject || 'תגובה מהבוט שלנו',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0;">${msg.businessName || 'BotPress AI'}</h2>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6; white-space: pre-line;">${msg.content}</p>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">נשלח באמצעות BotPress AI</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { success: false, error: 'RESEND_API_KEY not set' }
  return { success: true }
}
