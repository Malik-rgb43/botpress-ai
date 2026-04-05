'use client'

import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { useRealtimeEscalations } from '@/hooks/use-realtime-escalations'
import {
  requestNotificationPermission,
  showEscalationNotification,
  playEscalationSound,
} from '@/lib/notifications'

interface EscalationContextType {
  pendingCount: number
  newConversationSignal: number
  newMessageSignal: number
  refreshCount: () => void
  notificationsEnabled: boolean
  enableNotifications: () => Promise<boolean>
}

const EscalationContext = createContext<EscalationContextType>({
  pendingCount: 0,
  newConversationSignal: 0,
  newMessageSignal: 0,
  refreshCount: () => {},
  notificationsEnabled: false,
  enableNotifications: async () => false,
})

export function useEscalationContext() {
  return useContext(EscalationContext)
}

export function EscalationProvider({ children }: { children: React.ReactNode }) {
  const { business } = useBusiness()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const hasRequestedRef = useRef(false)

  // Check initial notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Auto-request notification permission on first load
  useEffect(() => {
    if (hasRequestedRef.current) return
    if (!business) return
    hasRequestedRef.current = true

    // Request permission after a short delay so it doesn't feel intrusive
    const timer = setTimeout(async () => {
      const granted = await requestNotificationPermission()
      setNotificationsEnabled(granted)
    }, 3000)
    return () => clearTimeout(timer)
  }, [business])

  const enableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)
    return granted
  }, [])

  const handleNewEscalation = useCallback((event: {
    id: string
    conversation_id: string
    reason: string
    customer?: string
  }) => {
    // Play sound
    playEscalationSound()

    // Show browser notification
    showEscalationNotification({
      customer: event.customer || 'לקוח',
      reason: event.reason || 'לקוח מבקש נציג',
      conversationId: event.conversation_id,
    })

    // Update page title to show alert
    const originalTitle = document.title
    let blink = true
    const titleInterval = setInterval(() => {
      document.title = blink ? `(!) לקוח מחכה לנציג — BotPress AI` : originalTitle
      blink = !blink
    }, 1500)

    // Stop blinking when user focuses the window
    const stopBlink = () => {
      clearInterval(titleInterval)
      document.title = originalTitle
      window.removeEventListener('focus', stopBlink)
    }
    window.addEventListener('focus', stopBlink)

    // Also stop after 60 seconds
    setTimeout(() => {
      clearInterval(titleInterval)
      document.title = originalTitle
      window.removeEventListener('focus', stopBlink)
    }, 60000)
  }, [])

  const {
    pendingCount,
    refreshCount,
    newConversationSignal,
    newMessageSignal,
  } = useRealtimeEscalations({
    businessId: business?.id || null,
    onNewEscalation: handleNewEscalation,
  })

  return (
    <EscalationContext.Provider value={{
      pendingCount,
      newConversationSignal,
      newMessageSignal,
      refreshCount,
      notificationsEnabled,
      enableNotifications,
    }}>
      {children}
    </EscalationContext.Provider>
  )
}
