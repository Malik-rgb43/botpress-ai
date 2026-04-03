'use client'

import { useState, useRef, useEffect } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, TestTube, RotateCcw, Bot, User } from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'bot'
  content: string
  layer?: string
  intent?: string
  sentiment?: string
}

const LAYER_LABELS: Record<string, string> = {
  faq: 'FAQ',
  ai: 'AI',
  transfer: 'העברה לנציג',
}

const SENTIMENT_LABELS: Record<string, string> = {
  positive: 'חיובי',
  neutral: 'ניטרלי',
  negative: 'שלילי',
  angry: 'כועס',
}

export default function PlaygroundPage() {
  const { business, loading: bizLoading } = useBusiness()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function send() {
    if (!input.trim() || !business || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          businessId: business.id,
          conversationHistory: history,
        }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.content || 'שגיאה בקבלת תשובה',
        layer: data.layer,
        intent: data.intent,
        sentiment: data.sentiment,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'שגיאה בחיבור לשרת' }])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([])
    setInput('')
  }

  if (bizLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <TestTube className="h-10 w-10 text-blue-300 mb-3" />
        <p className="text-gray-500 font-medium text-lg">צריך ליצור עסק קודם</p>
        <p className="text-gray-400 text-sm mt-1 mb-4">כדי לבדוק את הבוט, צריך קודם להגדיר את פרטי העסק, FAQ ומדיניות</p>
        <a href="/onboarding">
          <Button className="gradient-primary border-0 shadow-md shadow-blue-500/20">
            הגדר את העסק שלך
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            נסה את הבוט
          </h1>
          <p className="text-gray-500 text-sm mt-1">שלח הודעות וראה איך הבוט עונה — כולל מאיזו שכבה הגיעה התשובה</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <RotateCcw className="h-4 w-4 ml-1" />
          התחל מחדש
        </Button>
      </div>

      <Card className="border-blue-100/60 shadow-none">
        <CardContent className="p-0">
          {/* Chat Area */}
          <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-blue-400">
                <Bot className="h-12 w-12 mb-3" />
                <p className="text-lg">שלח הודעה כדי להתחיל</p>
                <p className="text-sm">הבוט ישתמש ב-FAQ, מדיניות ו-AI לענות</p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? '' : 'justify-end'}`}>
                      {msg.role === 'user' ? (
                        <><User className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-400">לקוח</span></>
                      ) : (
                        <><span className="text-xs text-gray-400">בוט</span><Bot className="h-3 w-3 text-gray-400" /></>
                      )}
                    </div>
                    <div className={`rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'gradient-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'bot' && (msg.layer || msg.intent || msg.sentiment) && (
                      <div className="flex gap-1 mt-1 justify-end flex-wrap">
                        {msg.layer && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            שכבה: {LAYER_LABELS[msg.layer] || msg.layer}
                          </Badge>
                        )}
                        {msg.intent && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            כוונה: {msg.intent}
                          </Badge>
                        )}
                        {msg.sentiment && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            רגש: {SENTIMENT_LABELS[msg.sentiment] || msg.sentiment}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="bg-gray-100 rounded-xl px-4 py-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="flex gap-2"
            >
              <Input
                placeholder="כתוב הודעה..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()} className="gradient-primary border-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
