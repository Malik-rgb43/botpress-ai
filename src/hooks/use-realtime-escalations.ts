'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface EscalationEvent {
  id: string
  conversation_id: string
  reason: string
  created_at: string
  customer?: string
}

interface UseRealtimeEscalationsOptions {
  businessId: string | null
  onNewEscalation?: (event: EscalationEvent) => void
}

export function useRealtimeEscalations({ businessId, onNewEscalation }: UseRealtimeEscalationsOptions) {
  const [pendingCount, setPendingCount] = useState(0)
  const [recentEscalations, setRecentEscalations] = useState<EscalationEvent[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const callbackRef = useRef(onNewEscalation)
  callbackRef.current = onNewEscalation

  // Load initial count of open escalations
  const loadPendingCount = useCallback(async () => {
    if (!businessId) return
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_open_escalation_count', {
      p_business_id: businessId,
    })
    if (!error && data !== null) {
      setPendingCount(typeof data === 'number' ? data : 0)
    }
  }, [businessId])

  // Subscribe to realtime escalation inserts
  useEffect(() => {
    if (!businessId) return

    loadPendingCount()

    const supabase = createClient()

    // Subscribe to new escalations for this business
    // We listen on the escalations table and join with conversations to filter by business
    const channel = supabase
      .channel(`escalations-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'escalations',
        },
        async (payload) => {
          const newEsc = payload.new as any
          // Verify this escalation belongs to our business by checking the conversation
          const { data: conv } = await supabase
            .from('conversations')
            .select('business_id, customer_identifier')
            .eq('id', newEsc.conversation_id)
            .single()

          if (conv?.business_id !== businessId) return

          const event: EscalationEvent = {
            id: newEsc.id,
            conversation_id: newEsc.conversation_id,
            reason: newEsc.reason || '',
            created_at: newEsc.created_at,
            customer: conv?.customer_identifier || 'לקוח',
          }

          setPendingCount(prev => prev + 1)
          setRecentEscalations(prev => [event, ...prev].slice(0, 10))
          callbackRef.current?.(event)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'escalations',
        },
        (payload) => {
          const updated = payload.new as any
          if (updated.status === 'resolved') {
            setPendingCount(prev => Math.max(0, prev - 1))
            setRecentEscalations(prev => prev.filter(e => e.id !== updated.id))
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [businessId, loadPendingCount])

  // Also subscribe to new conversations for instant dashboard updates
  const [newConversationSignal, setNewConversationSignal] = useState(0)
  const [newMessageSignal, setNewMessageSignal] = useState(0)

  useEffect(() => {
    if (!businessId) return

    const supabase = createClient()

    const convChannel = supabase
      .channel(`conversations-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const newConv = payload.new as any
          if (newConv.business_id === businessId) {
            setNewConversationSignal(prev => prev + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMsg = payload.new as any
          // Verify this message belongs to our business before processing
          const { data: conv } = await supabase
            .from('conversations')
            .select('business_id')
            .eq('id', newMsg.conversation_id)
            .single()
          if (conv?.business_id !== businessId) return
          setNewMessageSignal(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(convChannel)
    }
  }, [businessId])

  const clearRecent = useCallback(() => {
    setRecentEscalations([])
  }, [])

  return {
    pendingCount,
    recentEscalations,
    clearRecent,
    refreshCount: loadPendingCount,
    newConversationSignal,
    newMessageSignal,
  }
}
