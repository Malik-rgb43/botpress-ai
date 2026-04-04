'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send } from 'lucide-react'

interface Msg {
  role: 'user' | 'bot'
  text: string
}

export default function HeroChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: 'שלום! אני הבוט של BotPress AI. שאל אותי משהו ותראה איך אני עונה.' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  async function send() {
    const text = input.trim()
    if (!text || typing) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setTyping(true)

    // Simulate AI response (no real API call — this is a demo)
    const responses: Record<string, string> = {
      'שעות': 'אנחנו פתוחים א׳-ה׳ 9:00-18:00, שישי 9:00-13:00.',
      'משלוח': 'משלוח חינם בהזמנות מעל 200₪. זמן אספקה 2-3 ימי עסקים.',
      'מחיר': 'המחירים שלנו מתחילים מ-₪99 לחודש. יש גם ניסיון ב-₪1.',
      'החזר': 'ניתן להחזיר מוצרים תוך 14 יום מיום הרכישה.',
    }

    setTimeout(() => {
      const key = Object.keys(responses).find(k => text.includes(k))
      const reply = key
        ? responses[key]
        : 'תודה על השאלה! בעסק אמיתי, הבוט היה עונה על בסיס ה-FAQ והמדיניות שהגדרת. נסה לשאול על שעות, משלוח, מחיר או החזרות.'
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
      setTyping(false)
    }, 800 + Math.random() * 500)
  }

  return (
    <div className="w-full max-w-[300px] mx-auto">
      {/* Phone frame */}
      <div className="bg-gray-900 rounded-[2.8rem] p-[5px] shadow-2xl shadow-blue-500/10 relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl z-10" />

        <div className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col" style={{ height: '580px' }}>
          {/* Header */}
          <div className="gradient-primary text-white px-5 py-3 pt-7 flex items-center gap-3 shrink-0" dir="rtl">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">BotPress AI</p>
              <p className="text-[10px] text-white/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                מקוון
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50" dir="rtl">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'gradient-primary text-white rounded-tr-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-end">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-2.5 flex items-center gap-2 bg-white shrink-0" dir="rtl">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="כתוב הודעה..."
              className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-300"
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Home indicator */}
          <div className="h-5 bg-white flex items-center justify-center shrink-0">
            <div className="w-28 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
