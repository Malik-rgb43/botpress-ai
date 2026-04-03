import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const channel = request.nextUrl.searchParams.get('channel')

    // Webhook endpoint ready for WhatsApp/Email integration
    console.log(`Webhook received for channel: ${channel}`, body)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// WhatsApp verification
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('hub.challenge')
  if (challenge) {
    return new NextResponse(challenge)
  }
  return NextResponse.json({ status: 'ok' })
}
