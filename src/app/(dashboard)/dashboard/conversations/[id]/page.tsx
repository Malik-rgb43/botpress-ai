'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowRight, Send, Loader2, Bot, User, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Message } from '@/types/database'

const LAYER_COLORS: Record<string, string> = {
  faq: 'bg-blue-50 text-blue-700',
  ai: 'bg-purple-50 text-purple-700',
  transfer: 'bg-orange-50 text-orange-700',
}

export default function ConversationDetailPage() {
  const params = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [agentInput, setAgentInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [params.id])

  async function loadMessages() {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.id as string)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)
  }

  async function sendAgentMessage() {
    if (!agentInput.trim()) return
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({
      conversation_id: params.id as string,
      role: 'agent',
      content: agentInput,
      response_layer: null,
    })
    if (error) {
      toast.error('שגיאה בשליחה')
    } else {
      toast.success('ההודעה נשלחה')
      setAgentInput('')
      loadMessages()
    }
    setSending(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/conversations">
          <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">פרטי שיחה</h1>
      </div>

      <Card className="border-blue-100/60 shadow-none">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-6">
            <div className="space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-[80%]">
                    <div className={`flex items-center gap-2 mb-1 ${msg.role === 'customer' ? '' : 'justify-end'}`}>
                      {msg.role === 'customer' && <><User className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-400">לקוח</span></>}
                      {msg.role === 'bot' && <><span className="text-xs text-gray-400">בוט</span><Bot className="h-3 w-3 text-gray-400" /></>}
                      {msg.role === 'agent' && <><span className="text-xs text-gray-400">נציג</span><UserCheck className="h-3 w-3 text-green-500" /></>}
                    </div>
                    <div className={`rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === 'customer' ? 'gradient-primary text-white' :
                      msg.role === 'agent' ? 'bg-green-50 text-green-900 border border-green-200' :
                      'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.response_layer && (
                      <div className="flex justify-end mt-1">
                        <Badge className={`text-[10px] h-5 ${LAYER_COLORS[msg.response_layer] || ''}`}>
                          {msg.response_layer}
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
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              ענה כנציג
            </p>
            <form onSubmit={(e) => { e.preventDefault(); sendAgentMessage() }} className="flex gap-2">
              <Input
                placeholder="כתוב תשובה כנציג..."
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !agentInput.trim()} variant="outline">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
