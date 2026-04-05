/**
 * Browser notification + sound utilities for escalation alerts
 */

let notificationPermission: NotificationPermission = 'default'

/** Request browser notification permission */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false

  if (Notification.permission === 'granted') {
    notificationPermission = 'granted'
    return true
  }

  if (Notification.permission === 'denied') {
    notificationPermission = 'denied'
    return false
  }

  const result = await Notification.requestPermission()
  notificationPermission = result
  return result === 'granted'
}

/** Show browser notification with direct link to conversation */
export function showEscalationNotification(opts: {
  customer: string
  reason: string
  conversationId: string
  appUrl?: string
}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const notification = new Notification('BotPress AI — לקוח מבקש נציג', {
    body: `${opts.customer}\n${opts.reason}`,
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    tag: `escalation-${opts.conversationId}`,
    requireInteraction: true,
    dir: 'rtl',
    lang: 'he',
  })

  notification.onclick = () => {
    const url = `${opts.appUrl || window.location.origin}/dashboard/conversations/${opts.conversationId}`
    window.focus()
    window.location.href = url
    notification.close()
  }

  // Auto-close after 30 seconds
  setTimeout(() => notification.close(), 30000)
}

/** Play alert sound for new escalation */
export function playEscalationSound() {
  if (typeof window === 'undefined') return

  try {
    // Create a simple notification sound using Web Audio API
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Two-tone alert: pleasant but attention-grabbing
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    playTone(880, now, 0.15)        // A5
    playTone(1108.73, now + 0.18, 0.15) // C#6
    playTone(1318.51, now + 0.36, 0.25) // E6

    // Close context after sounds finish
    setTimeout(() => ctx.close(), 1000)
  } catch {
    // Fallback: do nothing if Web Audio not available
  }
}
