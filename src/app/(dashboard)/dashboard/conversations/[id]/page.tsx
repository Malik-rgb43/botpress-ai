'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Send, Loader2, Bot, User, UserCheck, Mail, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useTranslation } from '@/i18n/provider'
import type { Message, Conversation, Escalation } from '@/types/database'

function ChannelBadge({ channel, t }: { channel: string; t: any }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    email: { bg: 'bg-blue-100', text: 'text-blue-700', label: t.common.channel_email },
    whatsapp: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: t.common.channel_whatsapp },
    widget: { bg: 'bg-purple-100', text: 'text-purple-700', label: t.common.channel_widget },
  }
  const c = config[channel] || { bg: 'bg-gray-100', text: 'text-gray-600', label: channel }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export default function ConversationDetailPage() {
  const params = useParams()
  const { business } = useBusiness()
  const { t, lang } = useTranslation()
  const locale = lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar-SA' : 'en-US'

  const LAYER_LABELS: Record<string, { label: string; color: string }> = {
    faq: { label: t.chat.layer_faq, color: 'bg-blue-100 text-blue-700' },
    ai: { label: t.chat.layer_ai, color: 'bg-purple-100 text-purple-700' },
    transfer: { label: t.chat.layer_transfer, color: 'bg-orange-100 text-orange-700' },
  }
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [escalation, setEscalation] = useState<Escalation | null>(null)
  const [resolvingEscalation, setResolvingEscalation] = useState(false)
  const [agentInput, setAgentInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadData() {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_conversation_detail', {
      p_conversation_id: params.id as string
    })

    if (error || !data) {
      setLoading(false)
      return
    }

    const detail = data as any
    setConversation(detail.conversation)
    setMessages(detail.messages || [])
    setEscalation(detail.escalation || null)
    setLoading(false)
  }

  async function handleResolveEscalation() {
    if (!escalation) return
    setResolvingEscalation(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('resolve_escalation', { p_escalation_id: escalation.id })
    if (error) {
      toast.error(t.common.error_updating)
    } else {
      toast.success(t.chat.marked_resolved)
      setEscalation(prev => prev ? { ...prev, status: 'resolved', resolved_at: new Date().toISOString() } : null)
    }
    setResolvingEscalation(false)
  }

  async function sendAgentMessage() {
    if (!agentInput.trim() || !conversation) return
    setSending(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('insert_agent_message', {
        p_conversation_id: params.id as string,
        p_content: agentInput,
      })

      if (error) {
        toast.error(t.chat.error_saving)
        setSending(false)
        return
      }

      const customerEmail = conversation.customer_identifier
      const channel = conversation.channel

      if (channel === 'email' && customerEmail.includes('@')) {
        const res = await fetch('/api/agent/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            message: agentInput,
            channel: 'email',
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(`נשלח ל-${customerEmail}`)
        } else {
          toast.warning('נשמר אבל לא נשלח — ' + (data.error || 'שגיאה'))
        }
      } else if (channel === 'whatsapp') {
        const res = await fetch('/api/agent/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: customerEmail,
            message: agentInput,
            channel: 'whatsapp',
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success(`נשלח ב-WhatsApp ל-${customerEmail}`)
        } else {
          toast.warning('נשמר אבל לא נשלח — ' + (data.error || 'שגיאה'))
        }
      } else {
        toast.success(t.chat.message_saved)
      }

      setAgentInput('')
      loadData()
    } catch {
      toast.error(t.chat.error_sending)
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  const channelSendLabel = t.chat.will_save

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/conversations">
          <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowRight className="h-4 w-4 text-gray-600" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {conversation?.customer_identifier}
            </h1>
            {conversation?.channel && <ChannelBadge channel={conversation.channel} t={t} />}
          </div>
          {conversation?.started_at && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(conversation.started_at).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              {new Date(conversation.started_at).toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      </div>

      {/* Escalation status bar */}
      {escalation && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-4 py-3 mb-4 border ${
            escalation.status === 'resolved'
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {escalation.status === 'resolved' ? (
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            )}
            <div>
              <span
                className={`text-sm font-medium ${
                  escalation.status === 'resolved' ? 'text-emerald-800' : 'text-orange-800'
                }`}
              >
                {escalation.status === 'resolved'
                  ? t.chat.status_resolved
                  : escalation.status === 'in_progress'
                  ? t.chat.status_in_progress
                  : t.chat.status_awaiting}
              </span>
              {escalation.reason && (
                <p className="text-xs text-gray-500 mt-0.5">{t.chat.reason} {escalation.reason}</p>
              )}
            </div>
          </div>
          {escalation.status !== 'resolved' && (
            <Button
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              onClick={handleResolveEscalation}
              disabled={resolvingEscalation}
            >
              {resolvingEscalation ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {t.chat.mark_resolved}
            </Button>
          )}
        </div>
      )}

      {/* Chat area */}
      <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px', maxHeight: '560px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {messages.map(msg => {
            const isCustomer = msg.role === 'customer'
            const isAgent = msg.role === 'agent'
            const isBot = msg.role === 'bot'

            return (
              <div key={msg.id} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
                {/* Role label */}
                <div className={`flex items-center gap-1.5 mb-1.5 ${isCustomer ? 'flex-row-reverse' : ''}`}>
                  {isCustomer && (
                    <>
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-[11px] text-gray-400 font-medium">{t.chat.role_customer}</span>
                    </>
                  )}
                  {isBot && (
                    <>
                      <Bot className="h-3 w-3 text-gray-400" />
                      <span className="text-[11px] text-gray-400 font-medium">{t.chat.role_bot}</span>
                    </>
                  )}
                  {isAgent && (
                    <>
                      <UserCheck className="h-3 w-3 text-emerald-500" />
                      <span className="text-[11px] text-emerald-600 font-medium">{t.chat.role_agent}</span>
                    </>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isCustomer
                      ? 'bg-blue-500 text-white rounded-tr-md'
                      : isAgent
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-tl-md'
                      : 'bg-gray-100 text-gray-900 rounded-tl-md'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Response layer badge */}
                {msg.response_layer && LAYER_LABELS[msg.response_layer] && (
                  <div className={`mt-1.5 ${isCustomer ? 'self-end' : 'self-start'}`}>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${LAYER_LABELS[msg.response_layer].color}`}
                    >
                      {LAYER_LABELS[msg.response_layer].label}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Agent reply form */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <div className="flex items-center gap-1.5 mb-2.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] text-gray-400">{channelSendLabel}</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendAgentMessage()
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={t.chat.input_placeholder}
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              disabled={sending}
              className="flex-1 bg-white border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              type="submit"
              disabled={sending || !agentInput.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-lg px-4 shadow-sm"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
