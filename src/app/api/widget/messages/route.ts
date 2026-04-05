import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET — Widget polls for new messages (agent replies)
export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get('conversationId')
  const after = request.nextUrl.searchParams.get('after')

  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data } = await supabase.rpc('get_conversation_messages', {
    p_conversation_id: conversationId,
    p_after: after || null,
  })

  return NextResponse.json({ messages: data || [] })
}
