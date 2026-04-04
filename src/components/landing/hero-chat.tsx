'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'

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

    const responses: Record<string, string> = {
      'שעות': 'אנחנו פתוחים א׳-ה׳ 9:00-18:00, שישי 9:00-13:00.',
      'משלוח': 'משלוח חינם בהזמנות מעל 200₪. זמן אספקה 2-3 ימי עסקים.',
      'מחיר': 'המחירים שלנו מתחילים מ-₪99 לחודש. יש גם ניסיון ב-₪1.',
      'החזר': 'ניתן להחזיר מוצרים תוך 14 יום מיום הרכישה.',
      'שלום': 'שלום! איך אפשר לעזור לך?',
      'תודה': 'בשמחה! אם יש עוד שאלות, אני כאן.',
    }

    setTimeout(() => {
      const key = Object.keys(responses).find(k => text.includes(k))
      const reply = key
        ? responses[key]
        : 'תודה על השאלה! בעסק אמיתי, הבוט עונה על בסיס ה-FAQ והמדיניות שהגדרת. נסה: שעות, משלוח, מחיר, החזרות.'
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
      setTyping(false)
    }, 800 + Math.random() * 500)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Chat card */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ height: '420px' }}>
        {/* Header */}
        <div className="gradient-primary px-5 py-4 flex items-center gap-3 shrink-0" dir="rtl">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">נסה את הבוט</p>
            <p className="text-[11px] text-white/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              כתוב שאלה וקבל תשובה
            </p>
          </div>
          <Sparkles className="h-4 w-4 text-white/50" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50" dir="rtl">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'gradient-primary text-white rounded-2xl rounded-tr-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-md shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-end">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
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
        <div className="border-t border-gray-100 p-3 flex items-center gap-2 bg-white shrink-0" dir="rtl">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="כתוב שאלה..."
            className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none border border-gray-200 focus:border-blue-300 transition-colors"
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
