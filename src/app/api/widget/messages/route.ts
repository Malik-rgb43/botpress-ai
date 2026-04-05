import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// GET — Widget polls for new messages (agent replies)
// Security: Requires both conversationId AND visitorId to prevent enumeration
export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get('conversationId')
  const visitorId = request.nextUrl.searchParams.get('visitorId')
  const after = request.nextUrl.searchParams.get('after')

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
  }

  // Rate limiting — 60 req/min per conversation (widget polls every 3s)
  const rlKey = getRateLimitKey(request, 'widget', conversationId)
  const rl = checkRateLimit(rlKey, RATE_LIMITS.widget)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = createAdminClient()

  // Verify conversation ownership: if visitorId is provided, check it matches
  if (visitorId) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('customer_identifier')
      .eq('id', conversationId)
      .single()

    if (!conv || conv.customer_identifier !== visitorId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
  }

  const { data } = await supabase.rpc('get_conversation_messages', {
    p_conversation_id: conversationId,
    p_after: after || null,
  })

  return NextResponse.json({ messages: data || [] })
}
