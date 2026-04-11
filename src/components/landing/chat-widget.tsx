'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'bot'
  content: string
}

// System context about BotPress AI — the bot knows everything about the product
const SYSTEM_CONTEXT = `אתה הבוט של BotPress AI — פלטפורמה לשירות לקוחות חכם לעסקים בישראל.

מידע על המוצר:
- BotPress AI מאפשר לעסקים ליצור בוט AI שעונה ללקוחות בוואטסאפ, אימייל ובצ'אט באתר
- הבוט סורק את האתר של העסק ולומד אוטומטית שאלות נפוצות, מדיניות, שעות פעילות ועוד
- מערכת 3 שכבות: שכבה 1 = חיפוש FAQ, שכבה 2 = AI מתקדם, שכבה 3 = העברה לנציג אנושי
- זמן תגובה ממוצע: 2 שניות
- תמיכה בעברית, אנגלית וערבית אוטומטית
- הקמה ב-3 דקות — רק מזינים כתובת אתר

פיצ'רים:
- סריקה אוטומטית של אתרים
- דשבורד אנליטיקס בזמן אמת
- זיכרון שיחות ללקוחות חוזרים
- סימולטור לבדיקת הבוט לפני עלייה לאוויר
- מעבר חלק לנציג אנושי
- דוחות אוטומטיים (יומי/שבועי/חודשי)
- כפתורי תשובות מהירות
- התאמה אישית — צבעים, טון דיבור, שם הבוט

תוכניות:
- ניסיון: ₪1 לחודש הראשון, 100 הודעות, כל הערוצים
- בסיסי: ₪99/חודש, 1,000 הודעות
- פרימיום: ₪299/חודש, הודעות ללא הגבלה, White Label

כללים:
- ענה בעברית תמיד (אלא אם שואלים באנגלית)
- היה ידידותי, מקצועי וקצר
- אם שואלים על מחירים — תן את הפרטים והפנה להרשמה
- אם שואלים שאלה שלא קשורה ל-BotPress AI — אמור שאתה יכול לעזור רק בנושאים הקשורים לפלטפורמה
- הוסף אימוג'י מדי פעם כדי להיות חם ונגיש
- בסוף תשובות על תוכניות/מחירים, הוסף: "רוצה להתחיל? נרשמים ב-botpress-ai.vercel.app/signup"
`

export function LandingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'היי! 👋 אני הבוט של BotPress AI. איך אפשר לעזור?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  async function send() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/landing-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          systemContext: SYSTEM_CONTEXT,
          history: messages.slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', content: data.content || 'סליחה, משהו השתבש. נסה שוב.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'סליחה, לא הצלחתי לענות. נסה שוב בעוד רגע.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center"
          >
            <MessageSquare className="h-6 w-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-6 z-50 w-[380px] max-h-[520px] rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-gray-300/40 overflow-hidden flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-l from-blue-600 to-purple-600 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">BotPress AI</p>
                  <p className="text-[10px] text-white/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    מקוון
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 min-h-0" style={{ maxHeight: '360px' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tl-sm'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tr-sm shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3 bg-white shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="שאל אותי על BotPress AI..."
                  disabled={loading}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
