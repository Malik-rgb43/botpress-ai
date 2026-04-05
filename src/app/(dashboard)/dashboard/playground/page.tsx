'use client'

import { useState, useRef, useEffect } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, TestTube, RotateCcw, Bot, User } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/i18n/provider'

interface ChatMessage {
  role: 'user' | 'bot'
  content: string
  layer?: string
  intent?: string
  sentiment?: string
}

export default function PlaygroundPage() {
  const { t } = useTranslation()

  const LAYER_LABELS: Record<string, string> = {
    faq: t.chat.layer_faq,
    ai: t.chat.layer_ai,
    transfer: t.chat.layer_transfer,
  }

  const SENTIMENT_LABELS: Record<string, string> = {
    positive: t.analytics.sentiment_positive,
    neutral: t.analytics.sentiment_neutral,
    negative: t.analytics.sentiment_negative,
    angry: t.analytics.sentiment_angry,
  }
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
        content: data.content || t.playground.error_response,
        layer: data.layer,
        intent: data.intent,
        sentiment: data.sentiment,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: t.playground.error_connection }])
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
        <p className="text-gray-500 font-medium text-lg">{t.common.need_business}</p>
        <p className="text-gray-400 text-sm mt-1 mb-4">{t.playground.setup_desc}</p>
        <Link href="/onboarding">
          <Button className="bg-[#2e90fa] border-0 shadow-md shadow-[#2e90fa]/25 rounded-xl hover:shadow-lg transition-all">
            {t.common.go_to_setup}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {t.playground.title}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t.playground.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="border-blue-200 text-blue-600 hover:bg-blue-50 w-fit">
          <RotateCcw className="h-4 w-4 ml-1" />
          {t.playground.reset}
        </Button>
      </div>

      <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm">
        <div className="p-0">
          {/* Chat Area */}
          <ScrollArea className="h-[350px] md:h-[500px] p-4 md:p-6" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-blue-400">
                <Bot className="h-12 w-12 mb-3" />
                <p className="text-lg">{t.playground.empty_message}</p>
                <p className="text-sm">{t.playground.empty_desc}</p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? '' : 'justify-end'}`}>
                      {msg.role === 'user' ? (
                        <><User className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-400">{t.chat.role_customer}</span></>
                      ) : (
                        <><span className="text-xs text-gray-400">{t.chat.role_bot}</span><Bot className="h-3 w-3 text-gray-400" /></>
                      )}
                    </div>
                    <div className={`rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#2e90fa] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'bot' && (msg.layer || msg.intent || msg.sentiment) && (
                      <div className="flex gap-1 mt-1 justify-end flex-wrap">
                        {msg.layer && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {t.playground.layer_label} {LAYER_LABELS[msg.layer] || msg.layer}
                          </Badge>
                        )}
                        {msg.intent && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {t.playground.intent_label} {msg.intent}
                          </Badge>
                        )}
                        {msg.sentiment && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {t.playground.sentiment_label} {SENTIMENT_LABELS[msg.sentiment] || msg.sentiment}
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
                    <div className="flex gap-1.5 items-center py-1">
                      <div className="w-2 h-2 rounded-full bg-[#2e90fa] animate-bounce" style={{animationDelay: '0ms'}} />
                      <div className="w-2 h-2 rounded-full bg-[#2e90fa] animate-bounce" style={{animationDelay: '150ms'}} />
                      <div className="w-2 h-2 rounded-full bg-[#2e90fa] animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
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
                placeholder={t.playground.input_placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()} className="bg-[#2e90fa] border-0 rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
