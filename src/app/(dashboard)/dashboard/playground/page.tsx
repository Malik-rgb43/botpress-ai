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

  const suggestionChips = [
    'מה שעות הפעילות?',
    'יש לכם משלוחים?',
    'מה מדיניות ההחזרות?',
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t.playground.title}</h1>
          <Button variant="outline" size="sm" onClick={reset} className="border-blue-200 text-blue-600 hover:bg-blue-50">
            <RotateCcw className="h-4 w-4 ml-1" />
            {t.playground.reset}
          </Button>
        </div>
        <p className="text-gray-400 text-sm mt-1">{t.playground.subtitle}</p>
      </div>

      <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm">
        {/* Gradient Header */}
        <div className="bg-gradient-to-l from-blue-600 to-purple-600 px-5 py-3.5 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-purple-600" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">BotPress AI</h2>
            <p className="text-white/70 text-xs">Online</p>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="h-[350px] md:h-[460px] bg-gray-50/80" ref={scrollRef}>
          <div className="p-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4 animate-pulse">
                  <Bot className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-gray-700 font-medium text-lg mb-1">{t.playground.empty_message}</p>
                <p className="text-gray-400 text-sm mb-6">{t.playground.empty_desc}</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {suggestionChips.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(chip); }}
                      className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all cursor-pointer shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  {/* Bot avatar (right side in RTL) */}
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 order-2">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#2e90fa] text-white rounded-2xl rounded-bl-md shadow-sm shadow-blue-200/50'
                        : 'bg-white text-gray-800 rounded-2xl rounded-br-md border border-gray-100 shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'bot' && (msg.layer || msg.intent || msg.sentiment) && (
                      <div className="flex gap-1.5 mt-1.5 justify-end flex-wrap">
                        {msg.layer && (
                          <Badge className="text-[10px] h-5 px-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                            {t.playground.layer_label} {LAYER_LABELS[msg.layer] || msg.layer}
                          </Badge>
                        )}
                        {msg.intent && (
                          <Badge className="text-[10px] h-5 px-2 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100">
                            {t.playground.intent_label} {msg.intent}
                          </Badge>
                        )}
                        {msg.sentiment && (
                          <Badge className="text-[10px] h-5 px-2 bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">
                            {t.playground.sentiment_label} {SENTIMENT_LABELS[msg.sentiment] || msg.sentiment}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-2 justify-end">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 order-2">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-br-md border border-gray-100 px-4 py-3 shadow-sm order-1">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '0ms'}} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '150ms'}} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-white px-4 py-3">
          <form
            onSubmit={(e) => { e.preventDefault(); send() }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder={t.playground.input_placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-full border-gray-200 bg-gray-50 px-4 h-11 text-sm focus:bg-white focus:border-blue-300 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-300/40 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="h-4 w-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
