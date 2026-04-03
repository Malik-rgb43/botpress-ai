'use client'

import { useState, useEffect } from 'react'
import { Bot, Send } from 'lucide-react'

interface ChatMessage {
  side: 'customer' | 'bot'
  text: string
  time: string
}

const MESSAGES: ChatMessage[] = [
  { side: 'customer', text: 'היי, מה שעות הפעילות? 👋', time: '10:42' },
  { side: 'bot', text: 'שלום! 😊 אנחנו פתוחים:\nא׳-ה׳ 9:00-18:00\nשישי 9:00-13:00', time: '10:42' },
  { side: 'customer', text: 'ומה לגבי משלוחים?', time: '10:43' },
  { side: 'bot', text: '🚚 משלוח חינם מעל 200₪!\nזמן אספקה: 2-3 ימי עסקים', time: '10:43' },
  { side: 'customer', text: 'מעולה! אפשר להזמין עכשיו?', time: '10:44' },
  { side: 'bot', text: 'בטח! 🛒 הנה הקישור להזמנה:\nwww.store.co.il/order\nאם תצטרך עזרה, אני כאן!', time: '10:44' },
]

export default function LiveChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    function showNext() {
      setVisibleCount(prev => {
        const next = prev + 1
        if (next > MESSAGES.length) {
          // Reset after a pause
          setTimeout(() => {
            setVisibleCount(0)
            setIsTyping(false)
            setTimeout(showNext, 800)
          }, 3000)
          return prev
        }

        // Show typing indicator before bot messages
        const nextMsg = MESSAGES[next - 1]
        if (nextMsg && nextMsg.side === 'bot') {
          setIsTyping(true)
          timeout = setTimeout(() => {
            setIsTyping(false)
            setVisibleCount(next)
            timeout = setTimeout(showNext, 1200)
          }, 1000)
        } else {
          timeout = setTimeout(showNext, 1200)
        }

        return next
      })
    }

    timeout = setTimeout(showNext, 600)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="w-full max-w-sm">
      {/* Phone frame */}
      <div className="bg-gray-900 rounded-[2rem] p-2 shadow-2xl shadow-blue-500/10 hover-glow transition-all">
        <div className="bg-white rounded-[1.5rem] overflow-hidden">
          {/* WhatsApp header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3" dir="rtl">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4.5 w-4.5 text-white" />
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
          <div className="bg-[#ECE5DD] p-3 space-y-2 min-h-[300px] max-h-[300px] overflow-hidden" dir="rtl">
            {MESSAGES.slice(0, visibleCount).map((msg, i) => (
              <div
                key={`${i}-${visibleCount > MESSAGES.length ? 'reset' : ''}`}
                className={`flex ${msg.side === 'customer' ? 'justify-start' : 'justify-end'}`}
                style={{
                  animation: 'fadeInUp 0.4s ease-out forwards',
                }}
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

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-end" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}>
                <div className="bg-[#DCF8C6] rounded-lg rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2" dir="rtl">
            <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-gray-400">כתוב הודעה...</div>
            <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center">
              <Send className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>
      </div>
      {/* Label */}
      <div className="text-center mt-3">
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-blue-100/60">💬 שיחה חיה — הבוט עונה בזמן אמת</span>
      </div>
    </div>
  )
}
