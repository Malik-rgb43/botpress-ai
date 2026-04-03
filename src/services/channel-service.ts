// Channel Service - Abstraction layer for WhatsApp, Email, and Widget channels
// When APIs are connected, only this file needs to change

export interface ChannelMessage {
  to: string
  content: string
  channel: 'whatsapp' | 'email' | 'widget'
  metadata?: Record<string, unknown>
}

export interface ChannelConfig {
  whatsapp?: {
    accountSid: string
    authToken: string
    fromNumber: string
  }
  email?: {
    apiKey: string
    fromEmail: string
    fromName: string
  }
}

export async function sendMessage(msg: ChannelMessage): Promise<{ success: boolean; messageId?: string }> {
  switch (msg.channel) {
    case 'whatsapp':
      return sendWhatsApp(msg)
    case 'email':
      return sendEmail(msg)
    case 'widget':
      // Widget messages are handled via real-time subscriptions
      return { success: true }
    default:
      return { success: false }
  }
}

async function sendWhatsApp(_msg: ChannelMessage): Promise<{ success: boolean; messageId?: string }> {
  // TODO: Implement Twilio WhatsApp integration
  console.log('WhatsApp sending not yet configured')
  return { success: false }
}

async function sendEmail(_msg: ChannelMessage): Promise<{ success: boolean; messageId?: string }> {
  // TODO: Implement Resend/SendGrid email integration
  console.log('Email sending not yet configured')
  return { success: false }
}

export async function receiveWebhook(
  channel: 'whatsapp' | 'email',
  _payload: unknown
): Promise<{ from: string; content: string } | null> {
  switch (channel) {
    case 'whatsapp':
      // TODO: Parse Twilio webhook payload
      return null
    case 'email':
      // TODO: Parse email webhook payload
      return null
    default:
      return null
  }
}
