'use client'

import { useState } from 'react'
import { Bot, Send, Sparkles, Zap, MessageSquare } from 'lucide-react'

const PRESET_QUESTIONS = [
  { q: 'מה שעות הפעילות?', a: 'אנחנו פתוחים א׳-ה׳ 9:00-18:00, שישי 9:00-13:00. נשמח לראות אותך! 😊', layer: 'FAQ' },
  { q: 'כמה עולה משלוח?', a: 'משלוח חינם בהזמנות מעל 200₪! 🚚 משלוח רגיל 29₪, זמן אספקה 2-3 ימי עסקים.', layer: 'FAQ' },
  { q: 'מה מדיניות ההחזרות?', a: 'ניתן להחזיר מוצרים תוך 14 יום מיום הרכישה, באריזה מקורית ועם חשבונית. ההחזר יתבצע תוך 5 ימי עסקים. 📦', layer: 'AI' },
  { q: 'אני רוצה נציג', a: 'מעביר אותך לנציג שירות. אנא המתן רגע, נציג יהיה איתך בקרוב! 👤', layer: 'Transfer' },
]

interface ChatMsg {
  role: 'user' | 'bot'
  text: string
  layer?: string
}

export default function InteractiveDemo() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [isTyping, setIsTyping] = useState(false)

  function handlePreset(preset: typeof PRESET_QUESTIONS[0]) {
    if (isTyping) return

    setMessages(prev => [...prev, { role: 'user', text: preset.q }])
    setIsTyping(true)

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: preset.a, layer: preset.layer }])
      setIsTyping(false)
    }, 800 + Math.random() * 600)
  }

  function reset() {
    setMessages([])
    setIsTyping(false)
  }

  const LAYER_COLORS: Record<string, string> = {
    FAQ: 'bg-blue-100 text-blue-600',
    AI: 'bg-violet-100 text-violet-600',
    Transfer: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-[0.07] scale-105" />
      <div className="relative bg-white rounded-2xl border border-blue-200/80 shadow-2xl shadow-blue-500/15 overflow-hidden hover-glow transition-all">
        {/* Header */}
        <div className="gradient-animated px-6 py-4 flex items-center justify-between" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">נסה את הבוט עכשיו!</p>
              <p className="text-white/70 text-[11px]">לחץ על שאלה וראה איך הבוט עונה</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={reset} className="text-white/60 hover:text-white text-xs transition-colors">
              התחל מחדש
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className="min-h-[260px] max-h-[260px] overflow-y-auto p-4 space-y-3 bg-gray-50/50" dir="rtl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <div className="w-14 h-14 rounded-2xl gradient-primary-soft flex items-center justify-center mb-3">
                <MessageSquare className="h-7 w-7 text-blue-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">בחר שאלה למטה וראה את הבוט בפעולה</p>
              <p className="text-gray-400 text-xs mt-1">התשובות מבוססות על FAQ ו-AI</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}
            >
              <div className={`max-w-[80%] ${
                msg.role === 'user'
                  ? 'gradient-primary text-white rounded-xl rounded-tr-sm'
                  : 'bg-white border border-blue-100 text-gray-800 rounded-xl rounded-tl-sm shadow-sm'
              } px-4 py-2.5 text-sm`}>
                {msg.text}
                {msg.layer && (
                  <div className="mt-1.5 flex justify-end">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${LAYER_COLORS[msg.layer] || ''}`}>
                      {msg.layer === 'FAQ' && '📚 FAQ Match'}
                      {msg.layer === 'AI' && '🤖 AI Response'}
                      {msg.layer === 'Transfer' && '👤 Agent Transfer'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-end" style={{ animation: 'fadeInUp 0.3s ease-out forwards' }}>
              <div className="bg-white border border-blue-100 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="border-t border-blue-50 p-4 bg-white" dir="rtl">
          <p className="text-[10px] text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> לחץ על שאלה לדוגמה:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((pq, i) => (
              <button
                key={i}
                onClick={() => handlePreset(pq)}
                disabled={isTyping}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-100"
              >
                {pq.q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
