'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bot, Send } from 'lucide-react'

const MESSAGES = [
  { side: 'customer' as const, text: 'היי, מה שעות הפעילות? 👋', time: '10:42' },
  { side: 'bot' as const, text: 'שלום! 😊 אנחנו פתוחים:\nא׳-ה׳ 9:00-18:00\nשישי 9:00-13:00', time: '10:42' },
  { side: 'customer' as const, text: 'ומה לגבי משלוחים?', time: '10:43' },
  { side: 'bot' as const, text: '🚚 משלוח חינם מעל 200₪!\nזמן אספקה: 2-3 ימי עסקים', time: '10:43' },
  { side: 'customer' as const, text: 'מעולה, תודה!', time: '10:44' },
  { side: 'bot' as const, text: 'בשמחה! 😊 אם תצטרך עזרה, אני כאן 24/7', time: '10:44' },
]

export default function LiveChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState<typeof MESSAGES>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const addMessage = useCallback(() => {
    if (currentIndex >= MESSAGES.length) {
      // Reset after pause
      setTimeout(() => {
        setVisibleMessages([])
        setCurrentIndex(0)
        setIsTyping(false)
      }, 2500)
      return
    }

    const msg = MESSAGES[currentIndex]

    if (msg.side === 'bot') {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        setVisibleMessages(prev => [...prev, msg])
        setCurrentIndex(prev => prev + 1)
      }, 900)
    } else {
      setVisibleMessages(prev => [...prev, msg])
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) addMessage()
    }, currentIndex === 0 && visibleMessages.length === 0 ? 500 : 1100)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [currentIndex, addMessage, visibleMessages.length])

  return (
    <div className="w-full max-w-[320px] mx-auto">
      {/* Phone frame - iPhone 15 proportions (393x852) */}
      <div className="bg-gray-900 rounded-[3rem] p-[5px] shadow-2xl shadow-blue-500/10 hover-glow transition-all relative" style={{ aspectRatio: '393/852' }}>
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-gray-900 rounded-full z-10" />
        <div className="bg-white rounded-[2.7rem] overflow-hidden h-full flex flex-col">
          {/* WhatsApp header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 pt-10 shrink-0" dir="rtl">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">BotPress AI</p>
              <p className="text-[10px] text-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                מקוון
              </p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="bg-[#ECE5DD] p-3 space-y-2 flex-1 overflow-hidden" dir="rtl">
            {visibleMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.side === 'customer' ? 'justify-start' : 'justify-end'}`}
                style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}
              >
                <div className={`${
                  msg.side === 'customer'
                    ? 'bg-white rounded-lg rounded-tr-sm'
                    : 'bg-[#DCF8C6] rounded-lg rounded-tl-sm'
                } px-3 py-2 max-w-[80%] shadow-sm`}>
                  {msg.text.split('\n').map((line, j) => (
                    <p key={j} className="text-[12px] text-gray-800">{line}</p>
                  ))}
                  <p className="text-[9px] text-gray-400 text-left mt-0.5 flex items-center gap-1">
                    {msg.time}
                    {msg.side === 'bot' && <span className="text-blue-400">✓✓</span>}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-end" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}>
                <div className="bg-[#DCF8C6] rounded-lg rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2 shrink-0" dir="rtl">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-gray-400">כתוב הודעה...</div>
            <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center">
              <Send className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>
      {/* Label */}
      <div className="text-center mt-3">
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-blue-100/60">💬 שיחה חיה — חוזר על עצמו</span>
      </div>
    </div>
  )
}
