'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/hooks/use-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, Send, Loader2, Bot, User, UserCheck, Mail, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Message, Conversation, Escalation } from '@/types/database'

const LAYER_COLORS: Record<string, string> = {
  faq: 'bg-blue-50 text-blue-700',
  ai: 'bg-purple-50 text-purple-700',
  transfer: 'bg-orange-50 text-orange-700',
}

export default function ConversationDetailPage() {
  const params = useParams()
  const { business } = useBusiness()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [escalation, setEscalation] = useState<Escalation | null>(null)
  const [resolvingEscalation, setResolvingEscalation] = useState(false)
  const [agentInput, setAgentInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    const supabase = createClient()
    const [msgRes, convRes, escRes] = await Promise.all([
      supabase.from('messages').select('*').eq('conversation_id', params.id as string).order('created_at', { ascending: true }),
      supabase.from('conversations').select('*').eq('id', params.id as string).single(),
      supabase.from('escalations').select('*').eq('conversation_id', params.id as string).order('created_at', { ascending: false }).limit(1).single(),
    ])
    setMessages(msgRes.data || [])
    setConversation(convRes.data)
    setEscalation(escRes.data || null)
    setLoading(false)
  }

  async function handleResolveEscalation() {
    if (!escalation) return
    setResolvingEscalation(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('escalations')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('conversation_id', params.id as string)
      if (error) {
        toast.error('שגיאה בעדכון הסטטוס')
        console.error('Resolve escalation error:', error)
      } else {
        toast.success('הסימון עודכן — טופל')
        setEscalation(prev => prev ? { ...prev, status: 'resolved', resolved_at: new Date().toISOString() } : null)
      }
    } catch (err) {
      console.error('Resolve error:', err)
      toast.error('שגיאה בעדכון')
    }
    setResolvingEscalation(false)
  }

  async function sendAgentMessage() {
    if (!agentInput.trim() || !conversation) return
    setSending(true)

    try {
      // 1. Save message to DB
      const supabase = createClient()
      const { error } = await supabase.from('messages').insert({
        conversation_id: params.id as string,
        role: 'agent',
        content: agentInput,
        response_layer: null,
      })

      if (error) {
        toast.error('שגיאה בשמירה')
        setSending(false)
        return
      }

      // 2. Send to customer via the right channel
      const customerEmail = conversation.customer_identifier
      const channel = conversation.channel

      if (channel === 'email' && customerEmail.includes('@')) {
        // Send via Gmail API
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
        // Send via WhatsApp API
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
        toast.success('ההודעה נשמרה')
      }

      setAgentInput('')
      loadData()
    } catch {
      toast.error('שגיאה בשליחה')
    }
    setSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
  }

  const channelLabel = conversation?.channel === 'email' ? 'אימייל' : conversation?.channel === 'whatsapp' ? 'וואטסאפ' : 'וידג׳ט'
  const channelIcon = conversation?.channel === 'email' ? Mail : MessageSquare

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/conversations">
            <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{conversation?.customer_identifier}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge variant="outline" className="text-xs gap-1">
                {channelLabel}
              </Badge>
              {conversation?.started_at && (
                <span>{new Date(conversation.started_at).toLocaleDateString('he-IL')} {new Date(conversation.started_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation status */}
      {escalation && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 mb-4 border ${
          escalation.status === 'resolved'
            ? 'bg-green-50 border-green-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center gap-2">
            {escalation.status === 'resolved' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <div>
              <span className={`text-sm font-medium ${escalation.status === 'resolved' ? 'text-green-800' : 'text-orange-800'}`}>
                {escalation.status === 'resolved' ? 'טופל' : escalation.status === 'in_progress' ? 'בטיפול' : 'ממתין למענה אנושי'}
              </span>
              {escalation.reason && (
                <p className="text-xs text-gray-500 mt-0.5">סיבה: {escalation.reason}</p>
              )}
            </div>
          </div>
          {escalation.status !== 'resolved' && (
            <Button
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleResolveEscalation}
              disabled={resolvingEscalation}
            >
              {resolvingEscalation ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              סמן כטופל
            </Button>
          )}
        </div>
      )}

      <Card className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-md hover:shadow-xl transition-all">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-6">
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[80%]">
                    <div className={`flex items-center gap-2 mb-1 ${msg.role === 'customer' ? '' : 'justify-end'}`}>
                      {msg.role === 'customer' && <><User className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-400">לקוח</span></>}
                      {msg.role === 'bot' && <><span className="text-xs text-gray-400">בוט</span><Bot className="h-3 w-3 text-gray-400" /></>}
                      {msg.role === 'agent' && <><span className="text-xs text-green-600 font-medium">נציג (אתה)</span><UserCheck className="h-3 w-3 text-green-500" /></>}
                    </div>
                    <div className={`rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === 'customer' ? 'bg-[#2e90fa] text-white' :
                      msg.role === 'agent' ? 'bg-green-50 text-green-900 border border-green-200' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.response_layer && (
                      <div className="flex justify-end mt-1">
                        <Badge className={`text-[10px] h-5 ${LAYER_COLORS[msg.response_layer] || ''}`}>
                          {msg.response_layer === 'faq' ? 'שאלות נפוצות' : msg.response_layer === 'ai' ? 'AI' : 'העברה לנציג'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Agent reply */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-gray-500">
                {conversation?.channel === 'email' ? `ענה כנציג — ישלח אימייל ל-${conversation.customer_identifier}` :
                 conversation?.channel === 'whatsapp' ? `ענה כנציג — ישלח וואטסאפ ל-${conversation?.customer_identifier}` :
                 'ענה כנציג'}
              </span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); sendAgentMessage() }} className="flex gap-2">
              <Input
                placeholder="כתוב תשובה..."
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !agentInput.trim()} className="bg-[#2e90fa] border-0 rounded-xl">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
